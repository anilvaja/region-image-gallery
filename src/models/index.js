const sequelize = require('../config/sequelize');
const Region = require('./Region');
const User = require('./User');
const Project = require('./Project');
const Image = require('./Image');

// Define associations
User.belongsTo(Region, { foreignKey: 'region_id' });
Region.hasMany(User, { foreignKey: 'region_id' });

Project.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Project, { foreignKey: 'user_id' });

Project.belongsTo(Region, { foreignKey: 'region_id' });
Region.hasMany(Project, { foreignKey: 'region_id' });

Image.belongsTo(Project, { foreignKey: 'project_id' });
Project.hasMany(Image, { foreignKey: 'project_id' });

module.exports = {
  sequelize,
  Region,
  User,
  Project,
  Image,
};
