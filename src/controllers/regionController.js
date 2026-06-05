const { Region } = require('../models');

// Get all regions (public) - used to populate gallery filters and the Region menu
const getRegions = async (req, res) => {
  try {
    const regions = await Region.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({ regions });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
};

module.exports = { getRegions };
