const Role = require('../models/role.model');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a role
// @route   POST /api/roles
// @access  Public
exports.createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Public
exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!role) {
      return res.status(404).json({ success: false, error: 'No role found' });
    }

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Public
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: 'No role found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};