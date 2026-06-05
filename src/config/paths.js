const path = require('path');

// Single source of truth for where uploaded files live on disk.
// Resolves to <project-root>/uploads so the static handler in app.js and the
// multer storage in imageRoutes.js always agree on the same directory.
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

module.exports = { UPLOADS_DIR };
