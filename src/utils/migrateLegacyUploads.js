const fs = require('fs');
const path = require('path');
const { UPLOADS_DIR } = require('../config/paths');

// Older versions wrote uploads to `src/uploads/<projectId>` (multer's __dirname
// was `src/routes`) while the static handler served `<root>/uploads`. Files
// uploaded back then are stranded and 404 on the gallery. This one-time, idempotent
// migration relocates any such files into the served directory on startup.
const LEGACY_UPLOADS_DIR = path.join(__dirname, '..', 'uploads'); // <root>/src/uploads

const moveRecursive = (srcDir, destDir) => {
  let moved = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      moved += moveRecursive(srcPath, destPath);
      if (fs.readdirSync(srcPath).length === 0) fs.rmdirSync(srcPath);
    } else if (!fs.existsSync(destPath)) {
      // Don't clobber a newer file that already lives in the served directory.
      fs.renameSync(srcPath, destPath);
      moved += 1;
    }
  }
  return moved;
};

const migrateLegacyUploads = () => {
  try {
    if (!fs.existsSync(LEGACY_UPLOADS_DIR)) return;
    if (path.resolve(LEGACY_UPLOADS_DIR) === path.resolve(UPLOADS_DIR)) return;

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const moved = moveRecursive(LEGACY_UPLOADS_DIR, UPLOADS_DIR);
    if (fs.readdirSync(LEGACY_UPLOADS_DIR).length === 0) fs.rmdirSync(LEGACY_UPLOADS_DIR);
    if (moved > 0) {
      console.log(`Migrated ${moved} legacy upload file(s) from src/uploads to ${UPLOADS_DIR}`);
    }
  } catch (err) {
    console.error('Legacy uploads migration failed:', err.message);
  }
};

module.exports = { migrateLegacyUploads };
