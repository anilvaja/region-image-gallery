const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadImage,
  getProjectImages,
  getGallery,
  deleteImage,
} = require('../controllers/imageController');
const { authenticateJWT } = require('../middleware/auth');
const { UPLOADS_DIR } = require('../config/paths');
const { getSettings } = require('../utils/settings');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId;
    const uploadDir = path.join(UPLOADS_DIR, String(projectId));
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Build the multer file-size limit from the current settings on each request
// so the configured limit takes effect without a server restart.
const uploadMiddleware = async (req, res, next) => {
  let maxFileSizeMb = 5;
  try {
    const settings = await getSettings();
    maxFileSizeMb = settings.max_file_size_mb;
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load upload settings' });
  }

  const upload = multer({
    storage,
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
    fileFilter,
  });

  upload.single('image')(req, res, (err) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? `File size exceeds the ${maxFileSizeMb}MB limit`
          : err.message;
      return res.status(400).json({ error: message });
    }
    next();
  });
};

// GET /gallery - Fetch all images across regions (public read-only)
router.get('/gallery', getGallery);

// POST /images/:projectId - Upload image to a project (authenticated)
router.post('/:projectId/upload', authenticateJWT, uploadMiddleware, uploadImage);

// GET /images/:projectId - Get all images for a project (authenticated)
router.get('/:projectId', authenticateJWT, getProjectImages);

// DELETE /images/:imageId - Delete an image (authenticated)
router.delete('/:imageId/delete', authenticateJWT, deleteImage);

module.exports = router;
