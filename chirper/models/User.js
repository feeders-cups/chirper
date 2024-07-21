const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: String,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
