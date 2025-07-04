const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DailyEntry = sequelize.define('DailyEntry', {
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
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'entry_date'
  },
  dailyFocus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'daily_focus'
  },
  whatShippedToday: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'what_shipped_today'
  },
  whatSlowedDown: {
    type: DataTypes.TEXT,
    field: 'what_slowed_down'
  },
  whatToFixTomorrow: {
    type: DataTypes.TEXT,
    field: 'what_to_fix_tomorrow'
  },
  hoursSpent: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    field: 'hours_spent',
    validate: {
      min: 0.01
    }
  },
  proofLink: {
    type: DataTypes.TEXT,
    field: 'proof_link'
  }
}, {
  tableName: 'daily_execution_entries',
  underscored: true,
  // REMOVE OR COMMENT OUT THIS ENTIRE INDEX BLOCK:
  // indexes: [
  //   {
  //     unique: true,
  //     fields: ['user_id', 'entry_date']
  //   }
  // ]
});

module.exports = DailyEntry;
