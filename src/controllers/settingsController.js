const { getSettings } = require('../utils/settings');

const serialize = (setting) => ({
  max_images_per_project: setting.max_images_per_project,
  max_file_size_mb: setting.max_file_size_mb,
});

const getSettingsHandler = async (req, res) => {
  try {
    const setting = await getSettings();
    return res.status(200).json({ settings: serialize(setting) });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const updateSettingsHandler = async (req, res) => {
  try {
    const { max_images_per_project, max_file_size_mb } = req.body;
    const setting = await getSettings();

    if (max_images_per_project !== undefined) {
      const value = parseInt(max_images_per_project, 10);
      if (Number.isNaN(value) || value < 1) {
        return res.status(400).json({ error: 'max_images_per_project must be a positive integer' });
      }
      setting.max_images_per_project = value;
    }

    if (max_file_size_mb !== undefined) {
      const value = parseInt(max_file_size_mb, 10);
      if (Number.isNaN(value) || value < 1) {
        return res.status(400).json({ error: 'max_file_size_mb must be a positive integer' });
      }
      setting.max_file_size_mb = value;
    }

    setting.updated_at = new Date();
    await setting.save();

    return res.status(200).json({ settings: serialize(setting) });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = { getSettingsHandler, updateSettingsHandler };
