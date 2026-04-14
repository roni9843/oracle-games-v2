const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const Game = require('../models/Game');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// Apply API key authentication to all provider routes
router.use(apiKeyAuth);

// GET /api/providers — Get all providers
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find({}).sort({ providerName: 1 });
    res.json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/providers/:providerCode — Get provider with its games
router.get('/:providerCode', async (req, res) => {
  try {
    const { providerCode } = req.params;

    const provider = await Provider.findOne({ providerCode: providerCode.toUpperCase() });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const games = await Game.find({ providerCode: provider.providerCode }).sort({ gameName: 1 });

    // Format games for launch data
    const formattedGames = games.map(game => ({
      _id: game._id,
      game_code: game.gameCode || 0,
      gameName: game.gameName,
      game_type: game.gameType || 0,
      jackpot: game.jackpot,
      image: game.image,
      eventGameType: game.eventGameType,
      freeTry: game.freeTry,
      seq: game.seq,
      rtp: game.rtp,
      balance: game.balance,
      provider_code: provider.providerCode
    }));

    res.json({
      success: true,
      provider: {
        _id: provider._id,
        providerCode: provider.providerCode,
        providerName: provider.providerName,
        gameType: provider.gameType
      },
      gameCount: games.length,
      games: formattedGames
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
