module.exports = {
  development: {
    username: process.env.DB_USSD_USER,
    password: process.env.DB_USSD_PASSWORD,
    database: process.env.DB_USSD_NAME,
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: false,
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: process.env.READING_DB_USERNAME,
    password: process.env.READING_DB_PASSWORD,
    database: process.env.READING_DB_NAME,
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: false,
  },
};
