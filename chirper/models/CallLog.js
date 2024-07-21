const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  conferenceId: String,
  phoneNumber: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CallLog', callLogSchema);
