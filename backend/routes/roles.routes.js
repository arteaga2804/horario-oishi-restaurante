const express = require('express');
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole
} = require('../controllers/role.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getRoles).post(protect, createRole);

router.route('/:id').put(protect, updateRole).delete(protect, deleteRole);

module.exports = router;