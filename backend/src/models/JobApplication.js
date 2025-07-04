// JobApplication.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'company_name'
  },
  positionTitle: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'position_title'
  },
  jobDescription: {
    type: DataTypes.TEXT,
    field: 'job_description'
  },
  applicationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'application_date'
  },
  status: {
    type: DataTypes.ENUM('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'),
    defaultValue: 'applied'
  },
  applicationUrl: {
    type: DataTypes.TEXT,
    field: 'application_url'
  },
  salaryRange: {
    type: DataTypes.STRING(100),
    field: 'salary_range'
  },
  location: {
    type: DataTypes.STRING
  },
  remoteOption: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'remote_option'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'job_applications',
  underscored: true // Added for created_at and updated_at
});

module.exports = JobApplication;
