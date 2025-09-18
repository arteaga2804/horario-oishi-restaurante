const express = require('express');
const {
  getScheduleHistoryList,
  getScheduleHistoryById,
  deleteScheduleHistory,
} = require('../controllers/history.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, authorize('admin', 'manager'), getScheduleHistoryList);
router.route('/:id').get(protect, authorize('admin', 'manager'), getScheduleHistoryById).delete(protect, authorize('admin'), deleteScheduleHistory);

module.exports = router;
