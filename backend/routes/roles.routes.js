const express = require('express');
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole
} = require('../controllers/role.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getRoles).post(protect, authorize('admin'), createRole);

router.route('/:id').put(protect, authorize('admin'), updateRole).delete(protect, authorize('admin'), deleteRole);

module.exports = router;