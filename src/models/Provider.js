const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  providerCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  providerName: {
    type: String,
    required: true,
    trim: true
  },
  gameType: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Provider', providerSchema);
