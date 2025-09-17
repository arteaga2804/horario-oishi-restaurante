const mongoose = require('mongoose');

const ScheduleHistorySchema = new mongoose.Schema({
  generationDate: {
    type: Date,
    default: Date.now,
  },
  weekId: {
    type: String,
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
  }],
  // Store a summary of the state at time of generation
  dailyStaffConfig: [
    { day: String, opening: Number, closing: Number, demand: String }
  ],
  weeklyHours: {
    type: Map,
    of: Number,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ScheduleHistory', ScheduleHistorySchema);
