// ProofFile.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProofFile = sequelize.define('ProofFile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dailyExecutionEntryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'daily_execution_entry_id',
    references: {
      model: 'daily_execution_entries',
      key: 'id'
    }
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name'
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_type'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'file_size'
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_url'
  },
  storagePath: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'storage_path'
  }
}, {
  tableName: 'proof_files',
  updatedAt: false, // This is explicitly set to false, so no change needed for updatedAt
  underscored: true // Added for created_at (if it exists and is used)
});

module.exports = ProofFile;