const Config = require('../models/config.model');

// @desc    Get configuration
// @route   GET /api/config
// @access  Public
exports.getConfig = async (req, res, next) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      // Create a default config if it doesn't exist
      config = await Config.create({
        dailyStaffConfig: [
          { day: 'Domingo', opening: 5, closing: 5, demand: 'Bajo' },
          { day: 'Lunes', opening: 5, closing: 5, demand: 'Bajo' },
          { day: 'Martes', opening: 5, closing: 5, demand: 'Bajo' },
          { day: 'Miércoles', opening: 5, closing: 5, demand: 'Bajo' },
          { day: 'Jueves', opening: 5, closing: 5, demand: 'Bajo' },
          { day: 'Viernes', opening: 7, closing: 7, demand: 'Alto' },
          { day: 'Sábado', opening: 7, closing: 7, demand: 'Alto' },
        ],
      });
    }
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update configuration
// @route   PUT /api/config
// @access  Public
exports.updateConfig = async (req, res, next) => {
  try {
    const config = await Config.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true,
      upsert: true, // Create if it doesn't exist
    });
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
