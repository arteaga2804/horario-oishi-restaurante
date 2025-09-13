const express = require('express');
const {
  generateSchedule,
  getSchedule,
  updateAssignment,
  swapAssignments,
  createAssignment
} = require('../controllers/schedule.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getSchedule).post(protect, authorize('admin'), createAssignment);
router.route('/generate').post(protect, authorize('admin'), generateSchedule);
router.route('/:id').put(protect, authorize('admin'), updateAssignment);
router.route('/swap').post(protect, authorize('admin'), swapAssignments);

module.exports = router;