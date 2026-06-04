const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processImage = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(parseInt(process.env.IMAGE_MAX_WIDTH) || 1080, null, {
        withoutEnlargement: true,
      })
      .jpeg({ quality: parseInt(process.env.IMAGE_QUALITY) || 75 })
      .toFile(outputPath);

    return {
      originalPath: inputPath,
      optimizedPath: outputPath,
      success: true,
    };
  } catch (error) {
    throw new Error('Image processing failed: ' + error.message);
  }
};

const validateImageFile = (file) => {
  const maxSize = parseInt(process.env.MAX_IMAGE_SIZE) || 5242880; // 5MB
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error(
      `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`
    );
  }

  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid image file type');
  }

  return true;
};

module.exports = {
  processImage,
  validateImageFile,
};
