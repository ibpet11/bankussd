require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USSD_USER,
    password: process.env.DB_USSD_PASSWORD,
    database: process.env.DB_USSD_NAME,
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: false,
  },
  production: {
    username: process.env.DB_USSD_USER,
    password: process.env.DB_USSD_PASSWORD,
    database: process.env.DB_USSD_NAME,
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: false,
  },
};
