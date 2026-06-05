const { Setting } = require('../models');

const DEFAULTS = {
  max_images_per_project: 10,
  max_file_size_mb: 5,
};

// Returns the single settings row, creating it with defaults if it does not exist.
const getSettings = async () => {
  let setting = await Setting.findOne({ order: [['id', 'ASC']] });
  if (!setting) {
    setting = await Setting.create(DEFAULTS);
  }
  return setting;
};

module.exports = { getSettings, DEFAULTS };
