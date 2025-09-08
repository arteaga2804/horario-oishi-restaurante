const express = require('express');
const {
  generateSchedule,
  getSchedule,
  updateAssignment,
  swapAssignments,
  createAssignment
} = require('../controllers/schedule.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getSchedule).post(protect, createAssignment);
router.route('/generate').post(protect, generateSchedule);
router.route('/:id').put(protect, updateAssignment);
router.route('/swap').post(protect, swapAssignments);

module.exports = router;