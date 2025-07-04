
require('dotenv').config();

const config = {
  development: {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      name: process.env.DB_NAME || 'job_tracker_db',
      username: process.env.DB_USER || 'sam',
      password: process.env.DB_PASSWORD || 'Nexa721Li'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'development_secret',
      expiresIn: process.env.JWT_EXPIRE || '30d'
    },
    server: {
      port: process.env.PORT || 5000
    },
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
      uploadPath: process.env.UPLOAD_PATH || './uploads'
    }
  },
  production: {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    server: {
      port: process.env.PORT || 5000
    },
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
      uploadPath: process.env.UPLOAD_PATH || './uploads'
    }
  }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];
