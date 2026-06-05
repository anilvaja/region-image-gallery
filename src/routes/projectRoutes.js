const express = require('express');
const {
  createProject,
  updateProject,
  getUserProjects,
  getProjectById,
  deleteProject,
} = require('../controllers/projectController');
const { authenticateJWT } = require('../middleware/auth');
const { validateUserRegion } = require('../middleware/region');

const router = express.Router();

// Apply JWT authentication to all project routes
router.use(authenticateJWT);

// POST /projects - Create a new project
router.post('/', validateUserRegion, createProject);

// GET /projects - Get all projects for authenticated user
router.get('/', getUserProjects);

// GET /projects/:projectId - Get single project
router.get('/:projectId', getProjectById);

// PUT /projects/:projectId - Update a project (title/description)
router.put('/:projectId', updateProject);

// DELETE /projects/:projectId - Delete a project
router.delete('/:projectId', deleteProject);

module.exports = router;
