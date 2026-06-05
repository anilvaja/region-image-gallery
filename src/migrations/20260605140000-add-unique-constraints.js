module.exports = {
  async up(queryInterface) {
    // Unique region name
    await queryInterface.addIndex('regions', ['name'], {
      unique: true,
      name: 'regions_name_unique',
    });

    // Unique user name
    await queryInterface.addIndex('users', ['name'], {
      unique: true,
      name: 'users_name_unique',
    });

    // Unique project title within a region
    await queryInterface.addIndex('projects', ['region_id', 'title'], {
      unique: true,
      name: 'projects_region_title_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('regions', 'regions_name_unique');
    await queryInterface.removeIndex('users', 'users_name_unique');
    await queryInterface.removeIndex('projects', 'projects_region_title_unique');
  },
};
