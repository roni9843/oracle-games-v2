const mongoose = require('mongoose');

const guestUserSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telegramId: {
    type: String,
    trim: true,
    default: ''
  },
  sessionEndsAt: {
    type: Date,
    required: true
  },
  isRestricted: {
    type: Boolean,
    default: false
  },
  playCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('GuestUser', guestUserSchema);
