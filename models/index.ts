// 'use strict';

// import fs from 'fs';
// import path from 'path';
// import { Sequelize, DataTypes } from 'sequelize';
// import process from 'process';
// import { Dialect } from 'sequelize/types';

// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// import config from '../config/config';

// const db: { [key: string]: any; sequelize?: Sequelize; Sequelize?: typeof Sequelize } = {};

// let sequelize: Sequelize;

// sequelize = new Sequelize(
//   config.development.database || 'neondb',
//   config.development.username || 'neondb_owner',
//   config.development.password || 'npg_UF6tvMmR3uKn',
//   {
//     host: config.development.host || 'ep-quiet-snow-999747.ap-southeast-2.aws.neon.tech',
//     dialect: 'postgres' as Dialect,
//     dialectOptions: config.development.dialectOptions,
//     logging: config.development.logging,
//   },
// );


// fs.readdirSync(__dirname)
//   .filter((file: string) => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.ts' &&
//       !file.endsWith('.test.ts')
//     );
//   })
//   .forEach((file: string) => {
//     const model = require(path.join(__dirname, file));
//     const modelDef = model.default || model;
//     const initializedModel = modelDef(sequelize, DataTypes);
//     db[initializedModel.name] = initializedModel;
//   });

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// export default db;

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db:any = {};

let sequelize:any;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter((file:string) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.ts' 
      //&&
      //file.indexOf('.test.ts') === -1
    );
  })
  .forEach((file:any) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
