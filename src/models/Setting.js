const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Setting = sequelize.define(
  'Setting',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    max_images_per_project: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    max_file_size_mb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'settings',
    timestamps: false,
  }
);

module.exports = Setting;
