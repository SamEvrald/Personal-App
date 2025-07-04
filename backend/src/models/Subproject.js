// Subproject.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subproject = sequelize.define('Subproject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused'),
    defaultValue: 'active'
  }
}, {
  tableName: 'subprojects',
  underscored: true, // Added for created_at and updated_at
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'name']
    }
  ]
});

module.exports = Subproject;