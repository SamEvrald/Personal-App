const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  deadline: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused', 'cancelled'),
    defaultValue: 'active'
  },
  totalHoursLogged: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'total_hours_logged'
  }
}, {
  tableName: 'projects',
  underscored: true, // This should be here
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'name']
    }
  ]
});

// ADD THIS CONSOLE.LOG LINE
console.log('Project Model Options:', Project.options);

module.exports = Project;
