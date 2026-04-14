const mongoose = require('mongoose');
const crypto = require('crypto');

const apiClientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  apiKey: {
    type: String,
    unique: true,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate API key before saving (only if new)
apiClientSchema.pre('validate', function (next) {
  if (!this.apiKey) {
    this.apiKey = crypto.randomUUID();
  }
  next();
});

// Static method to generate new API key
apiClientSchema.methods.regenerateKey = function () {
  this.apiKey = crypto.randomUUID();
  return this.save();
};

module.exports = mongoose.model('ApiClient', apiClientSchema);
