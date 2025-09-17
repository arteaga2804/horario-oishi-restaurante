const ScheduleHistory = require('../models/scheduleHistory.model');

// @desc    Get all schedule history records (metadata only)
// @route   GET /api/history
// @access  Admin/Manager
exports.getScheduleHistoryList = async (req, res, next) => {
  try {
    const historyList = await ScheduleHistory.find()
      .select('-assignments -dailyStaffConfig -weeklyHours') // Exclude large fields
      .populate('generatedBy', 'username')
      .sort({ generationDate: -1 });

    res.status(200).json({ success: true, data: historyList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get a specific historical schedule with all details
// @route   GET /api/history/:id
// @access  Admin/Manager
exports.getScheduleHistoryById = async (req, res, next) => {
  try {
    const historyRecord = await ScheduleHistory.findById(req.params.id).populate([
      {
        path: 'generatedBy',
        select: 'username'
      },
      {
        path: 'assignments',
        populate: {
          path: 'worker role',
        },
      },
    ]);

    if (!historyRecord) {
      return res.status(404).json({ success: false, error: 'History record not found' });
    }

    res.status(200).json({ success: true, data: historyRecord });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
