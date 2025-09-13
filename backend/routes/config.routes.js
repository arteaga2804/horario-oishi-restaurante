const express = require('express');
const { getConfig, updateConfig } = require('../controllers/config.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getConfig).put(protect, authorize('admin'), updateConfig);

module.exports = router;