const express = require('express');
const { getConfig, updateConfig } = require('../controllers/config.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getConfig).put(protect, updateConfig);

module.exports = router;