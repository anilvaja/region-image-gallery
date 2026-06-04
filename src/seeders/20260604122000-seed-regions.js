module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('regions', [
      {
        name: 'South',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'East',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'West',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'North',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('regions', null, {});
  },
};
