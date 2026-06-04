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

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId;
    const uploadDir = path.join(__dirname, '..', 'uploads', String(projectId));
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const statusCode = err instanceof multer.MulterError ? 400 : 400;
      return res.status(statusCode).json({ error: err.message });
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
