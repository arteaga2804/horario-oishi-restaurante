const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  day: {
    type: Number, // 0=Domingo, 1=Lunes, etc.
    required: true,
  },
  shift: {
    type: String,
    enum: ['opening', 'closing'],
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  // We can add a week identifier to group assignments
  weekId: {
    type: String, // e.g., '2025-W34'
    required: true,
  }
});

// To prevent a worker from being assigned to the same shift twice
AssignmentSchema.index({ day: 1, shift: 1, worker: 1, weekId: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);