const express = require('express');
const {
  getSettingsHandler,
  updateSettingsHandler,
} = require('../controllers/settingsController');

const router = express.Router();

// GET /api/settings - read global settings (public)
router.get('/', getSettingsHandler);

// PUT /api/settings - update global settings
router.put('/', updateSettingsHandler);

module.exports = router;
