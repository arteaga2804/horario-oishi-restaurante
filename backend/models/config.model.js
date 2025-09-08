const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  dailyStaffConfig: [
    { day: String, opening: Number, closing: Number, demand: String }
  ],
});

module.exports = mongoose.model('Config', ConfigSchema);
