const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  contractType: {
    type: String,
    enum: ['Tiempo Completo', 'Part Time Dia', 'Part Time Noche'],
    default: 'Tiempo Completo',
  },
  weeklyHours: {
    type: Number,
    default: 40,
  },
  daysOff: {
    type: [Number], // Array of numbers (0=Domingo, 1=Lunes, etc.)
    default: [],
  },
  primaryRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  secondaryRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  tertiaryRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
});

module.exports = mongoose.model('Worker', WorkerSchema);