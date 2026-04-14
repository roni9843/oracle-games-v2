const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameCode: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    unique: false
  },

  gameName: {
    type: String,
    required: true,
    trim: true
  },
  jackpot: {
    type: String,
    default: 'FALSE'
  },
  image: {
    type: String,
    default: null
  },
  gameType: {
    type: String,
    default: null
  },
  eventGameType: {
    type: String,
    default: null
  },
  freeTry: {
    type: String,
    default: 'FALSE'
  },
  seq: {
    type: Number,
    default: 0
  },
  rtp: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: null
  },
  providerCode: {
    type: String,
    required: true,
    trim: true
  },
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
gameSchema.index({ providerCode: 1 });
gameSchema.index({ gameType: 1 });

module.exports = mongoose.model('Game', gameSchema);
