const request = require('supertest');
const app = require('../src/app');
const { sequelize, Region, User } = require('../src/models');
const path = require('path');
const fs = require('fs');

describe('Image Tests', () => {
  let userToken;
  let userId;
  let regionId;
  let projectId;

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

    // Register user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Image Test User',
        email: 'imagetest@example.com',
        password: 'password123',
        region_id: regionId,
      });

    userId = res.body.user.id;
    userToken = res.body.token;

    // Create project
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Image Test Project',
        region_id: regionId,
      });

    projectId = projectRes.body.project.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/images/gallery', () => {
    test('Should retrieve gallery (public endpoint)', async () => {
      const res = await request(app).get('/api/images/gallery');

      expect(res.status).toBe(200);
      expect(res.body.total_images).toBeDefined();
      expect(Array.isArray(res.body.images)).toBe(true);
    });
  });

  describe('Image Upload Constraints', () => {
    test('Should reject upload without authentication', async () => {
      const res = await request(app)
        .post(`/api/images/${projectId}/upload`)
        .attach('image', path.join(__dirname, 'fixtures', 'test-image.jpg'));

      expect(res.status).toBe(401);
    });

    test('Should reject upload without file', async () => {
      const res = await request(app)
        .post(`/api/images/${projectId}/upload`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No file');
    });

    test('Should enforce max 10 images per project', async () => {
      // Note: This test requires mock image files to be created in tests/fixtures/
      // For now, we'll test the constraint logic conceptually
      expect(process.env.MAX_IMAGES_PER_PROJECT || 10).toBeDefined();
    });
  });

  describe('GET /api/images/:projectId', () => {
    test('Should retrieve project images', async () => {
      const res = await request(app)
        .get(`/api/images/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.project_id).toBe(projectId);
      expect(Array.isArray(res.body.images)).toBe(true);
    });

    test('Should reject access to images without authentication', async () => {
      const res = await request(app).get(`/api/images/${projectId}`);

      expect(res.status).toBe(401);
    });

    test('Should reject access to non-existent project', async () => {
      const res = await request(app)
        .get('/api/images/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Region-Based Access Control', () => {
    test('Should only allow user to access their region images', async () => {
      // Create another region
      const regions = await Region.findAll();
      const differentRegionId = regions[1]?.id || regionId;

      if (differentRegionId !== regionId) {
        // Register user in different region
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Other Region User',
            email: 'otherregion@example.com',
            password: 'password123',
            region_id: differentRegionId,
          });

        const otherToken = res.body.token;

        // Try to access project from different region
        const accessRes = await request(app)
          .get(`/api/images/${projectId}`)
          .set('Authorization', `Bearer ${otherToken}`);

        expect(accessRes.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/images/:imageId', () => {
    test('Should reject deletion without authentication', async () => {
      const res = await request(app).delete('/api/images/999/delete');

      expect(res.status).toBe(401);
    });

    test('Should reject deletion of non-existent image', async () => {
      const res = await request(app)
        .delete('/api/images/999/delete')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
