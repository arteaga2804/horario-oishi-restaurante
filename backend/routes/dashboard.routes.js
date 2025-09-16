const express = require('express');
const {
  getSummary
} = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/summary').get(protect, authorize('admin', 'manager'), getSummary);

module.exports = router;