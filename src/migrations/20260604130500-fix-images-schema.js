module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'images';
    const tableDescription = await queryInterface.describeTable(tableName);

    if (!tableDescription.title) {
      await queryInterface.addColumn(tableName, 'title', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      });
    }

    if (!tableDescription.file_url) {
      await queryInterface.addColumn(tableName, 'file_url', {
        type: Sequelize.STRING(500),
        allowNull: false,
        defaultValue: '',
      });
    }

    if (!tableDescription.optimized_url) {
      await queryInterface.addColumn(tableName, 'optimized_url', {
        type: Sequelize.STRING(500),
        allowNull: false,
        defaultValue: '',
      });
    }

    if (!tableDescription.file_name) {
      await queryInterface.addColumn(tableName, 'file_name', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      });
    }

    if (!tableDescription.file_size) {
      await queryInterface.addColumn(tableName, 'file_size', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDescription.mime_type) {
      await queryInterface.addColumn(tableName, 'mime_type', {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '',
      });
    }

    if (tableDescription.url) {
      await queryInterface.sequelize.query(
        `UPDATE ${tableName} SET file_url = url WHERE file_url = '' OR file_url IS NULL;`
      );
      await queryInterface.sequelize.query(
        `UPDATE ${tableName} SET optimized_url = url WHERE optimized_url = '' OR optimized_url IS NULL;`
      );
    }
  },

  async down(queryInterface) {
    const tableName = 'images';
    const tableDescription = await queryInterface.describeTable(tableName);

    if (tableDescription.title) {
      await queryInterface.removeColumn(tableName, 'title');
    }
    if (tableDescription.file_url) {
      await queryInterface.removeColumn(tableName, 'file_url');
    }
    if (tableDescription.optimized_url) {
      await queryInterface.removeColumn(tableName, 'optimized_url');
    }
    if (tableDescription.file_name) {
      await queryInterface.removeColumn(tableName, 'file_name');
    }
    if (tableDescription.file_size) {
      await queryInterface.removeColumn(tableName, 'file_size');
    }
    if (tableDescription.mime_type) {
      await queryInterface.removeColumn(tableName, 'mime_type');
    }
  },
};
