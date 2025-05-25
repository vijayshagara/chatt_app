import { FindAndCountOptions, IncludeOptions, Op } from 'sequelize'
import { isEmptyObject } from './helper'

interface Filter {
    model: any
    joinModels?: {
        model: any
        as: string
        where?: any
        attributes?: any[]
        include?: any[]
        required?: boolean
        separate?: boolean
        order?: any[]
    }[]
    filters: any
    where?: any
    conditions?: any
    attributes?: any
    raw?: boolean
    dateFields?: string[]
    subQuery?: boolean
    group?: string[]
    order?: string | any[]
}

const searchFilter = async (filter: Filter) => {
    try {
        const { model, joinModels, filters, conditions, raw, dateFields, subQuery, group, where } = filter
        let { attributes, order } = filter

        let limit: number = 0
        let skip: number = 0
        const all_rows = filters.all_rows || false
        order = filters.order || 'id:desc'
        const row_count = filters.row_count || false

        // Remove extracted keys
        delete filters.order
        delete filters.row_count

        if (filters.limit) {
            limit = parseInt(filters.limit, 10) || 0
        }

        if (filters.skip) {
            skip = parseInt(filters.skip, 10) || 0
        }

        if (!attributes) {
            attributes = { exclude: [] }
        }

        if (!model) {
            throw new Error('Model is required!')
        }

        let queryOptions: FindAndCountOptions<any> = {
            include: [] as IncludeOptions[],
            where: conditions || {},
            attributes: attributes,
            distinct: true,
            group: group,
            // Uncomment this line to see the generated SQL
            // logging: console.log,
        }

        if (raw !== undefined) {
            queryOptions.raw = raw
        }

        if (subQuery !== undefined) {
            queryOptions.subQuery = subQuery
        }

        if (!filters.all_rows) {
            // Add limit and offset if applicable
            if (limit > 0) {
                queryOptions = {
                    ...queryOptions,
                    offset: skip || 0,
                    limit: limit,
                }
            }
        }
        delete filters.limit
        delete filters.skip

        if (filters.export_as) delete filters.export_as

        if (filters.all_rows != undefined) delete filters.all_rows

        const removeUndefinedKeys = (obj: any) =>
            Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))

        const removeEmptyArrays = (obj: any) =>
            Object.entries(obj).reduce((acc: any, [key, value]) => {
                if (!Array.isArray(value) || value.length > 0) {
                    acc[key] = value
                }
                return acc
            }, {})

        // OPERATORS list
        const operatorMapping: { [key: string]: symbol } = {
            // Equal to, Not equal to
            ne: Op.ne,
            eq: Op.eq,
            // Greater than or equal to , Greater than
            gte: Op.gte,
            gt: Op.gt,
            // Lesser than or equal to, Lesser than
            lte: Op.lte,
            lt: Op.lt,
            // LIKE, NOT LIKE, ILIKE (case insensitive)
            like: Op.like,
            nlike: Op.notLike,
            ilike: Op.iLike,
            // IN , NOT IN
            in: Op.in,
            nin: Op.notIn,
            // IS null ,IS NOT null
            is: Op.is,
            isn: Op.not,
            // Between, Not between
            btw: Op.between,
            nbtw: Op.notBetween,
            or: Op.or,
        }

        // Add join models to the include array
        if (Array.isArray(joinModels) && joinModels.length > 0) {
            joinModels.forEach((joinModel) => {
                let includeOptions: IncludeOptions = {
                    model: joinModel.model,
                    as: joinModel.as,
                    where: joinModel.where,
                    attributes: joinModel.attributes,
                    include: joinModel.include || [],
                    required: joinModel.required,
                    separate: joinModel.separate,
                    order: joinModel.order,
                }
                includeOptions = removeUndefinedKeys(includeOptions)
                includeOptions = removeEmptyArrays(includeOptions)
                    ; (queryOptions.include as IncludeOptions[]).push(includeOptions)
            })
        }

        if (where != undefined) {
            queryOptions.where = where
        }

        // Process filters
        Object.keys(filters).forEach((key) => {
            const [field, rawOperator] = key.split('___')
            // Setting default operator as 'equal to'
            let operator = rawOperator || 'eq'

            if (!operatorMapping[operator]) {
                throw new Error(`Unsupported operator "${operator}" for field "${field}".`)
            }

            let filterValue = filters[key]
            // Check for columnName for dateFields

            if (dateFields?.includes(key)) {
                operator = 'btw'
                filterValue = `${filterValue} 00:00:00,${filterValue} 23:59:59`
            }

            // Operator functionality
            if (operator === 'like' || operator === 'ilike') {
                filterValue = `%${filterValue}%`
            }

            if (['btw', 'nbtw', 'in', 'nin'].includes(operator)) {
                filterValue = filterValue.split(',')
                if (!Array.isArray(filterValue)) {
                    throw new Error(`Operator "${operator}" requires an array value for field "${field}".`)
                }
            }
            if (operator === 'or') {
                const fields = field.split(',')
                const filterField: any[] = []
                fields.forEach((f) => {
                    if (field.includes('__')) {
                        const [tables, column_name] = f.split('__')
                        filterField.push({ [`$${tables}.${column_name}$`]: { [Op.like]: `%${filterValue}%` } })
                    } else {
                        filterField.push({ [f]: { [Op.like]: `%${filterValue}%` } })
                    }
                })
                    ; (queryOptions.where as any)[Op.or] = filterField
            } else {
                const isOperator = ['is', 'isn']

                if (field.includes('__')) {
                    // tables and column_name are separated by __
                    const [tables, column_name] = field.split('__')
                    // Split the tables by '.' to get the table names"
                    const tableList = tables.split('.')
                    let currentInclude = queryOptions.include as IncludeOptions[]

                    tableList.forEach((table, index) => {
                        const foundInclude = currentInclude.find((inc) => {
                            return inc.as === table.trim()
                        })

                        if (!foundInclude) {
                            throw new Error(`Table "${table}" is not included in the query options.`)
                        }

                        if (index === tableList.length - 1) {
                            if (!foundInclude.where) foundInclude.where = {}

                            if (isOperator.includes(operator) && filterValue === 'null') {
                                foundInclude.required = operator === 'isn'
                            } else {
                                ; (foundInclude.where as any)[column_name] = {
                                    [operatorMapping[operator]]: filterValue,
                                }
                            }
                        } else {
                            currentInclude = foundInclude.include as IncludeOptions[]
                        }
                    })
                } else {
                    queryOptions.where = queryOptions.where || {}
                        ; (queryOptions.where as any)[field] = {
                            [operatorMapping[operator]]: filterValue,
                        }
                }
            }
        })

        if (queryOptions.where && isEmptyObject(queryOptions.where as any)) {
            delete queryOptions.where
        }

        // ORDER BY
        if (order && typeof order === 'string') {
            queryOptions.order = []
            const orderFields = order.split(',')
            orderFields.forEach((orderField: string) => {
                const [field, direction] = orderField.split(':')

                // Setting default value as DESC, id no direction is provided
                const directionUpper = direction ? direction.toUpperCase() : 'DESC'

                if (!['ASC', 'DESC'].includes(directionUpper)) {
                    console.warn(`Invalid direction "${direction}". Defaulting to DESC.`)
                }

                if (field.includes('.')) {
                    // Handling nested relationships
                    const fieldParts = field.split('.')
                    const associationPath: any[] = []
                    let isValid = true
                    let currentInclude = queryOptions.include as IncludeOptions[] | undefined

                    for (let i = 0; i < fieldParts.length - 1; i++) {
                        const associationAlias = fieldParts[i].trim()
                        const includeOption = currentInclude?.find((inc: IncludeOptions) => inc.as === associationAlias)

                        if (!includeOption) {
                            console.warn(`Association "${associationAlias}" not found in includes. Skipping order.`)
                            isValid = false
                            break
                        }

                        associationPath.push({
                            model: includeOption.model,
                            as: associationAlias,
                        })
                        currentInclude = includeOption.include as IncludeOptions[] | undefined
                    }

                    if (isValid) {
                        const orderField = fieldParts[fieldParts.length - 1].trim()
                            ; (queryOptions.order as any[]).push([...associationPath, orderField, directionUpper])
                    }
                } else {
                    // Only push order fields that exist in the model's attributes
                    if (model?.rawAttributes && Object.prototype.hasOwnProperty.call(model.rawAttributes, field)) {
                        ; (queryOptions.order as any[]).push([field, directionUpper])
                    }
                }
            })
        }
        // Uncomment to check the order_by options
        // console.log("Query Options:", queryOptions);

        // Execute the query with count
        let totalCount = 0
        let data: any[] = []

        if (row_count) {
            totalCount = await model.count({
                where: queryOptions.where,
                include: queryOptions.include,
            })
        } else {
            const { count: rowCount, rows } = await model.findAndCountAll(queryOptions)
            totalCount = Array.isArray(rowCount) ? rowCount.length : rowCount
            data = rows.map((row: any) => {
                if (typeof row.toJSON === 'function') {
                    return row.toJSON()
                }
                return row
            })
        }

        let result: {
            status: boolean
            message?: string
            totalCount: number
            data: any[]
            totalPages?: number
            limit?: number
            skip?: number
        } = {
            status: true,
            message: 'Data fetched successfully',
            totalCount: totalCount,
            data: data || [],
        }

        if (limit > 0 && !row_count) {
            result = {
                status: result.status,
                message: result.message,
                totalCount: result.totalCount,

                data: result.data,
            }
            if (!all_rows) {
                result = {
                    ...result,
                    totalPages: Math.ceil(totalCount / limit),
                    limit: limit,
                    skip: skip,
                }
            }
        }

        return result
    } catch (error) {
        console.error('Error executing query: ', error)
        throw error
    }
}

export default searchFilter
