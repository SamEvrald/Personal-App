// WeeklyReview.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeeklyReview = sequelize.define('WeeklyReview', {
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
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id',
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  subprojectId: {
    type: DataTypes.UUID,
    field: 'subproject_id',
    references: {
      model: 'subprojects',
      key: 'id'
    }
  },
  weekStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'week_start_date'
  },
  whatShipped: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'what_shipped'
  },
  whatFailedToDeliver: {
    type: DataTypes.TEXT,
    field: 'what_failed_to_deliver'
  },
  whatDistracted: {
    type: DataTypes.TEXT,
    field: 'what_distracted'
  },
  whatLearned: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'what_learned'
  },
  hoursSpent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'hours_spent',
    validate: {
      min: 0.01
    }
  }
}, {
  tableName: 'weekly_review_entries',
  underscored: true, // Added for created_at and updated_at
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'week_start_date', 'project_id']
    }
  ]
});

module.exports = WeeklyReview;