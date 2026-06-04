const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const passwordHash = bcrypt.hashSync('123', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Anil Vaja',
        email: 'anilvaja.007@gmail.com',
        password_hash: passwordHash,
        region_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'anilvaja.007@gmail.com' }, {});
  },
};
