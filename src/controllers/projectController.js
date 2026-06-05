const { Op } = require('sequelize');
const { Project, User, Region } = require('../models');

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, region_id } = req.body;
    const userId = req.user.user_id;
    const userRegionId = req.user.region_id;

    // Validate required fields
    if (!title || !region_id) {
      return res.status(400).json({
        error: 'Missing required fields: title, region_id',
      });
    }

    // Ensure user can only create projects in their assigned region
    if (parseInt(region_id) !== userRegionId) {
      return res.status(403).json({
        error: 'You can only create projects in your assigned region',
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify region exists
    const region = await Region.findByPk(region_id);
    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    // Enforce unique project title within a region
    const duplicate = await Project.findOne({
      where: { region_id, title: title.trim() },
    });
    if (duplicate) {
      return res.status(409).json({
        error: 'A project with this title already exists in this region',
      });
    }

    // Create project
    const project = await Project.create({
      title: title.trim(),
      description,
      user_id: userId,
      region_id,
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        user_id: project.user_id,
        region_id: project.region_id,
        created_at: project.created_at,
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'A project with this title already exists in this region',
      });
    }
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project: ' + error.message });
  }
};

// Update a project (title/description)
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;
    const userId = req.user.user_id;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or access denied',
      });
    }

    // Enforce unique title within the project's region (excluding itself)
    const duplicate = await Project.findOne({
      where: {
        region_id: project.region_id,
        title: title.trim(),
        id: { [Op.ne]: project.id },
      },
    });
    if (duplicate) {
      return res.status(409).json({
        error: 'A project with this title already exists in this region',
      });
    }

    project.title = title.trim();
    project.description = description !== undefined ? description : project.description;
    await project.save();

    return res.status(200).json({
      message: 'Project updated successfully',
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        user_id: project.user_id,
        region_id: project.region_id,
        created_at: project.created_at,
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'A project with this title already exists in this region',
      });
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project: ' + error.message });
  }
};

// Get all projects for a user
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const projects = await Project.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Region,
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects: ' + error.message });
  }
};

// Get a single project by ID
const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.user_id;

    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
      include: [
        {
          model: Region,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or access denied',
      });
    }

    return res.status(200).json({
      project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project: ' + error.message });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.user_id;

    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or access denied',
      });
    }

    await project.destroy();

    return res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project: ' + error.message });
  }
};

module.exports = {
  createProject,
  updateProject,
  getUserProjects,
  getProjectById,
  deleteProject,
};
