const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código del rol es obligatorio'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'El nombre del rol es obligatorio'],
    trim: true,
  },
  color: {
    type: String,
    default: '#FF6B6B',
  },
});

module.exports = mongoose.model('Role', RoleSchema);