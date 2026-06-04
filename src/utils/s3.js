const fs = require('fs');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

const uploadToS3 = async (filePath, s3Key) => {
  try {
    const destinationPath = path.join(uploadsRoot, s3Key);
    const destinationDir = path.dirname(destinationPath);
    fs.mkdirSync(destinationDir, { recursive: true });
    fs.copyFileSync(filePath, destinationPath);

    return destinationPath.startsWith(uploadsRoot)
      ? destinationPath.substring(uploadsRoot.length).replace(/\\/g, '/')
      : destinationPath;
  } catch (error) {
    throw new Error('Local upload failed: ' + error.message);
  }
};

const deleteFromS3 = async (s3Key) => {
  try {
    const targetPath = path.join(uploadsRoot, s3Key);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch (error) {
    throw new Error('Local delete failed: ' + error.message);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
