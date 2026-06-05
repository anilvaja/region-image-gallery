const express = require('express');
const { getRegions } = require('../controllers/regionController');

const router = express.Router();

// GET /regions - public list of regions for gallery filters and the Region menu
router.get('/', getRegions);

module.exports = router;
