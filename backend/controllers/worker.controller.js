const Worker = require('../models/worker.model');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
exports.getWorkers = async (req, res, next) => {
  try {
    const workers = await Worker.find().populate('primaryRole secondaryRole tertiaryRole');
    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a worker
// @route   POST /api/workers
// @access  Public
exports.createWorker = async (req, res, next) => {
  try {
    let worker = await Worker.create(req.body);
    worker = await worker.populate('primaryRole secondaryRole tertiaryRole');
    res.status(201).json({ success: true, data: worker });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a worker
// @route   PUT /api/workers/:id
// @access  Public
exports.updateWorker = async (req, res, next) => {
  console.log('Backend updateWorker - ID recibido:', req.params.id);
  console.log('Backend updateWorker - Body recibido:', req.body);
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('primaryRole').populate('secondaryRole').populate('tertiaryRole');

    if (!worker) {
      return res.status(404).json({ success: false, error: 'No worker found' });
    }

    res.status(200).json({ success: true, data: worker });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a worker
// @route   DELETE /api/workers/:id
// @access  Public
exports.deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ success: false, error: 'No worker found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};