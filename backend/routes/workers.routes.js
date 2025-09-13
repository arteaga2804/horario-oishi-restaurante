const express = require('express');
const {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/worker.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getWorkers).post(protect, authorize('admin'), createWorker);

router.route('/:id').put(protect, authorize('admin'), updateWorker).delete(protect, authorize('admin'), deleteWorker);

module.exports = router;