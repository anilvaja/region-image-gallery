const { Image, Project, User, Region } = require('../models');
const { validateImageFile, processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { UPLOADS_DIR } = require('../config/paths');

const MAX_IMAGES_PER_PROJECT = parseInt(process.env.MAX_IMAGES_PER_PROJECT) || 10;

// Upload image to a project
const uploadImage = async (req, res) => {
  let tempPath = null;
  let processedPath = null;
  let caughtError = null;

  try {
    const { projectId } = req.params;
    const userId = req.user.user_id;

    // Validate file exists
    if (!req.file) {
      throw new Error('No file provided');
    }

    tempPath = req.file.path;

    // Validate image file
    validateImageFile(req.file);

    // Verify project belongs to user
    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or access denied',
      });
    }

    // Check image count limit
    const imageCount = await Image.count({ where: { project_id: projectId } });
    if (imageCount >= MAX_IMAGES_PER_PROJECT) {
      return res.status(400).json({
        error: `Maximum ${MAX_IMAGES_PER_PROJECT} images per project reached`,
      });
    }

    // Process image (resize and compress)
    const uploadDir = path.dirname(tempPath);
    const optimizedFilename = path.parse(req.file.filename).name + '_optimized.jpg';
    const optimizedPath = path.join(uploadDir, optimizedFilename);
    const processedResult = await processImage(tempPath, optimizedPath);
    processedPath = processedResult.optimizedPath;

    const originalUrl = `/uploads/${projectId}/${req.file.filename}`;
    const optimizedUrl = `/uploads/${projectId}/${optimizedFilename}`;
    const title = req.file.originalname || req.file.filename;

    // Save image metadata to database
    const image = await Image.create({
      project_id: projectId,
      title,
      file_url: originalUrl,
      optimized_url: optimizedUrl,
      file_name: req.file.filename,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
    });

    return res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: image.id,
        project_id: image.project_id,
        file_url: image.file_url,
        optimized_url: image.optimized_url,
        file_name: image.file_name,
        created_at: image.created_at,
      },
    });
  } catch (error) {
    caughtError = error;
    console.error('Upload image error:', error);
    const statusCode =
      error.message === 'No file provided' ||
      error.message === 'Invalid image file type' ||
      error.message.startsWith('File size exceeds')
        ? 400
        : 500;

    return res.status(statusCode).json({
      error: 'Image upload failed: ' + error.message,
    });
  } finally {
    if (caughtError) {
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      if (processedPath && fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    }
  }
};

// Get all images for a project
const getProjectImages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.user_id;

    // Verify project belongs to user
    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or access denied',
      });
    }

    // Get images
    const images = await Image.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      project_id: projectId,
      image_count: images.length,
      images,
    });
  } catch (error) {
    console.error('Get project images error:', error);
    res.status(500).json({
      error: 'Failed to fetch images: ' + error.message,
    });
  }
};

// Get all images across all regions (gallery view)
const getGallery = async (req, res) => {
  try {
    const images = await Image.findAll({
      include: [
        {
          model: Project,
          attributes: ['id', 'title', 'region_id'],
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Region,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      total_images: images.length,
      images,
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      error: 'Failed to fetch gallery: ' + error.message,
    });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.user_id;

    // Find image and verify access
    const image = await Image.findOne({
      include: [
        {
          model: Project,
          where: { user_id: userId },
          required: true,
        },
      ],
      where: { id: imageId },
    });

    if (!image) {
      return res.status(404).json({
        error: 'Image not found or access denied',
      });
    }

    // Delete local files from uploads directory
    const deleteLocalFile = async (url) => {
      if (!url) return;
      const localPath = path.join(UPLOADS_DIR, url.replace(/^\/?uploads\//, ''));
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    };

    await deleteLocalFile(image.file_url);
    await deleteLocalFile(image.optimized_url);

    // Delete from database
    await image.destroy();

    return res.status(200).json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      error: 'Failed to delete image: ' + error.message,
    });
  }
};

module.exports = {
  uploadImage,
  getProjectImages,
  getGallery,
  deleteImage,
};
