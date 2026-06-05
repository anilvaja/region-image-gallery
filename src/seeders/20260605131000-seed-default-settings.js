module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('settings', [
      {
        max_images_per_project: 10,
        max_file_size_mb: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('settings', null, {});
  },
};
