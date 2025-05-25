import Conversations from '../models/conversations.model';
import ConversationParticipants from '../models/conversationParticipants.model';
import Messages from '../models/messages.model';
import { DB_NAME, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, NODE_ENV } from '../config';
import { logger } from '../utils/logger';
import { Sequelize } from 'sequelize-typescript';

const path = require('path');

export const sequelize = new Sequelize(DB_NAME || 'default_db_name', DB_USER || 'default_user', DB_PASSWORD || 'default_password', {
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432', 10),
  models: [path.resolve('src/models')],
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
  },
  pool: {
    min: 0,
    max: 5,
    acquire: 120000,
  },
  logQueryParameters: NODE_ENV === 'development' || NODE_ENV === 'dockerdev',
  logging: (query, time) => {
    if (NODE_ENV === 'development' || (time !== undefined && time >= 1000)) {
      logger.info((time || 0) + 'ms' + ' ' + query);
    }
  },
  benchmark: true,
  dialectOptions: {
    connectTimeout: 120000,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  retry: {
    max: 5,
  },
});

sequelize.authenticate();

const DB = {
  Conversations: sequelize.getRepository(Conversations),
  Messages: sequelize.getRepository(Messages),
  ConversationParticipants: sequelize.getRepository(ConversationParticipants),
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};

export default DB;
