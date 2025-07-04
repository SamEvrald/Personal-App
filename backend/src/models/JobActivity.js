// JobActivity.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobActivity = sequelize.define('JobActivity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobApplicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'job_application_id',
    references: {
      model: 'job_applications',
      key: 'id'
    }
  },
  activityType: {
    type: DataTypes.ENUM('application', 'follow_up', 'phone_screen', 'interview', 'offer', 'rejection', 'withdrawal'),
    allowNull: false,
    field: 'activity_type'
  },
  activityDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'activity_date'
  },
  description: {
    type: DataTypes.TEXT
  },
  contactPerson: {
    type: DataTypes.STRING,
    field: 'contact_person'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'job_application_activities',
  updatedAt: false, // This is explicitly set to false
  underscored: true // Added for created_at (if it exists and is used)
});

module.exports = JobActivity;
