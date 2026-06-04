const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Region = sequelize.define(
  'Region',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    // Future expansion: state_id and city_id can be added here
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
    tableName: 'regions',
    timestamps: false,
  }
);

module.exports = Region;
