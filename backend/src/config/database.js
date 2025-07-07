
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'job_tracker_db',
  username: process.env.DB_USER || 'sam',
  password: process.env.DB_PASSWORD || 'Nexa721Li',
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },

  dialectOptions: {
    ssl: {
      // This is often required for cloud MySQL databases.
      // Setting rejectUnauthorized to false allows connections even if
      // the server's SSL certificate isn't directly trusted by the client's CA bundle.
      // In a production environment, ideally you'd configure your server
      // to trust the specific CA, but for ease of deployment, this is common.
      rejectUnauthorized: false
    }
  }
});

module.exports = { sequelize };
