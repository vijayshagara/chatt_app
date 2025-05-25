# Documentation for `searchFilter`

## Parameters

### Input: `Filter`

The `Filter` object contains the following properties:

### 1. **filters** (required)

- Type: `{ [key: string]: any }`
- Description: Filter conditions for querying data.
- Special Fields:
  - `limit`: Number of records to fetch (for pagination).
  - `skip`: Number of records to skip (for pagination).
  - `row_count`: Boolean indicating whether to return only the total count.

---

## Filter Syntax

The `filters` object defines conditions using the following pattern:

## `.(dot)` for join tables split

## `__(double underscore)` for column_name split

## `___(triple underscore)` fro operator split

### **Main Table**

## `column_name___operator=value`

- Example:
  ```
  name___like=John
  age___gte=25
  ```
- Applies the filter to the main table columns.

### **Join Tables**

## `JoinTable__column_name___operator=value`

- Example:
  ```
  Profile__city___eq=New York
  ```
- Applies the filter to a column (`city`) in a joined table (`Profile`).

### **Nested Join Tables**

## `ParentJoinTable.ChildJoinTable__column_name___operator=value`

- Example:
  ```
  State.Zone__region___like=North
  ```
- Applies the filter to a column (`region`) in a nested join table (`Zone`) under the parent join table (`State`).

---

## General operators SQL_Expression ex_query_param

    eq              =>     column = value                             columnname__eq=value
    ne              =>     column != value                            columnname__ne=value
    gt              =>     column > value                             columnname__gt=value
    gte             =>     column >= value                            columnname__gte=value
    lt              =>     column < value                             columnname__lt=value
    lte             =>     column <= value                            columnname__lte=value
    like            =>     column LIKE '%value%'                       columnname__like=%value%
    nlike           =>     column NOT LIKE '%value%'                   columnname__nlike=%value%
    ilike           =>     column ILIKE '%value%'                      columnname__ilike=%value%
    in              =>     column IN (value1, value2, ...)             columnname__in=value1,value2,...
    nin             =>     column NOT IN (value1, value2, ...)         columnname__nin=value1,value2,...
    is              =>     column IS NULL                             columnname__is=null
    isn             =>     column IS NOT NULL                         columnname__isn=null
    btw             =>     column BETWEEN value1 AND value2           columnname__btw=value1,value2
    nbtw            =>     column NOT BETWEEN value1 AND value2       columnname__nbtw=value1,value2

---

## Pagination

To implement pagination, use the `limit` and `skip` filters:

- **Limit**: Number of records to fetch.
- **Skip**: Number of records to skip.

### Example:

```
filters: {
  limit: "10",
  skip: "20",
}
```

---

## Examples

### 1. Basic Pagination

Fetch 10 records starting from the 20th record:

```
filters: {
  limit: "10",
  skip: "20",
}
```

### 2. Count Only

Fetch only the count of records:

```
filters: {
  row_count: true,
}
```

## Order syntax

Order in query params (eg: order=Station.Zone.id:asc,id:asc)

### **order**

## Sample syntax:

# _For `Main` table use column_name and sorting order_

## `order=ColumnName:DESC`

(or)

## `order=TableName.JoinTableName.ColumnName:ASC`

(or)

## `order=TableName.JoinTableName.ColumnName:DESC`

(or)

## `order=TableName.ColumnName:DESC`

Example:

```
http://localhost:3000/api/v1/dccsstatements?limit=10&order=Station.id:desc,id:desc,Station.Zone.id:asc
```
