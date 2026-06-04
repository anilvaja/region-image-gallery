const request = require('supertest');
const app = require('../src/app');
const { sequelize, Region, User } = require('../src/models');
const { generateToken } = require('../src/utils/jwt');

describe('Project Tests', () => {
  let userToken;
  let userId;
  let regionId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Seed regions
    const regions = await Region.bulkCreate([
      { name: 'South' },
      { name: 'East' },
      { name: 'West' },
      { name: 'North' },
    ]);

    regionId = regions[0].id;

    // Register and login a user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'projecttest@example.com',
        password: 'password123',
        region_id: regionId,
      });

    userId = res.body.user.id;
    userToken = res.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/projects', () => {
    test('Should create a project with valid data', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Project',
          description: 'A test project',
          region_id: regionId,
        });

      expect(res.status).toBe(201);
      expect(res.body.project.title).toBe('Test Project');
      expect(res.body.project.region_id).toBe(regionId);
      expect(res.body.project.user_id).toBe(userId);
    });

    test('Should reject project creation without authentication', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({
          title: 'Unauthorized Project',
          region_id: regionId,
        });

      expect(res.status).toBe(401);
    });

    test('Should reject project creation with missing fields', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Missing title',
        });

      expect(res.status).toBe(400);
    });

    test('Should reject project creation in different region', async () => {
      // Create second region
      const regions = await Region.findAll();
      const differentRegionId = regions.length > 1 ? regions[1].id : regionId;

      if (differentRegionId !== regionId) {
        const res = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            title: 'Different Region Project',
            region_id: differentRegionId,
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain('assigned region');
      }
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create a test project
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Project 1',
          region_id: regionId,
        });
    });

    test('Should retrieve user projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.projects.length).toBeGreaterThan(0);
    });

    test('Should reject projects request without authentication', async () => {
      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects/:projectId', () => {
    let projectId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Single Project',
          region_id: regionId,
        });

      projectId = res.body.project.id;
    });

    test('Should retrieve a single project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.project.id).toBe(projectId);
    });

    test('Should reject access to non-existent project', async () => {
      const res = await request(app)
        .get('/api/projects/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:projectId', () => {
    let projectId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Project to Delete',
          region_id: regionId,
        });

      projectId = res.body.project.id;
    });

    test('Should delete a project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });

    test('Should reject deletion of non-existent project', async () => {
      const res = await request(app)
        .delete('/api/projects/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
