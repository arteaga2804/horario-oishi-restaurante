const express = require('express');
const {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/worker.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getWorkers).post(protect, createWorker);

router.route('/:id').put(protect, updateWorker).delete(protect, deleteWorker);

module.exports = router;