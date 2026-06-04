const request = require('supertest');
const app = require('../src/app');
const { sequelize, Region, User } = require('../src/models');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Seed regions
    await Region.bulkCreate([
      { name: 'South' },
      { name: 'East' },
      { name: 'West' },
      { name: 'North' },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    test('Should register a user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          region_id: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('john@example.com');
      expect(res.body.user.region_id).toBe(1);
      expect(res.body.token).toBeDefined();
    });

    test('Should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('Should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          region_id: 1,
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password456',
          region_id: 1,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    test('Should reject invalid region_id', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid User',
          email: 'invalid@example.com',
          password: 'password123',
          region_id: 999,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Region not found');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: 'logintest@example.com',
          password: 'testpass123',
          region_id: 1,
        });
    });

    test('Should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'testpass123',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('logintest@example.com');
      expect(res.body.token).toBeDefined();
    });

    test('Should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });

    test('Should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });

    test('Should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing');
    });
  });
});
