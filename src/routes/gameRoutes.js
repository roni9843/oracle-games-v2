const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Game = require('../models/Game');
const Provider = require('../models/Provider');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// Apply API key authentication to all game routes
router.use(apiKeyAuth);

// GET /api/games — Get all games with provider info (pagination + filters)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.gameType) filter.gameType = req.query.gameType.toUpperCase();
    if (req.query.providerCode) filter.providerCode = req.query.providerCode.toUpperCase();

    const totalCount = await Game.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const games = await Game.find(filter)
      .sort({ gameName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get unique providerCodes from this page
    const providerCodes = [...new Set(games.map(g => g.providerCode))];
    const providers = await Provider.find({ providerCode: { $in: providerCodes } }).lean();
    const providerMap = {};
    providers.forEach(p => {
      providerMap[p.providerCode] = {
        provider_code: p.providerCode,
        providerName: p.providerName,
        gameType: p.gameType
      };
    });

    // Format games with provider info
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
      provider: providerMap[game.providerCode] || { provider_code: game.providerCode }
    }));

    res.json({
      success: true,
      count: totalCount,
      page,
      limit,
      totalPages,
      data: formattedGames
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/games/by-ids — Get multiple games by IDs (comma-separated ids query param)
router.get('/by-ids', async (req, res) => {
  try {
    const rawIds = Array.isArray(req.query.ids)
      ? req.query.ids
      : (req.query.ids || '').split(',');

    const ids = rawIds
      .map(id => id.trim())
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Provide one or more valid game ids via ids query param (comma separated).'
      });
    }

    const games = await Game.find({ _id: { $in: ids } }).lean();

    if (!games.length) {
      return res.status(404).json({ success: false, message: 'No games found for supplied ids.' });
    }

    const providerCodes = [...new Set(games.map(g => g.providerCode))];
    const providers = await Provider.find({ providerCode: { $in: providerCodes } }).lean();
    const providerMap = {};
    providers.forEach(p => {
      providerMap[p.providerCode] = {
        provider_code: p.providerCode,
        providerName: p.providerName,
        gameType: p.gameType
      };
    });

    const formatted = games.map(game => ({
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
      provider: providerMap[game.providerCode] || { provider_code: game.providerCode }
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'One or more game ids are invalid.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/games/:id — Get single game by MongoDB ID with provider info
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).lean();

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Get provider info
    const provider = await Provider.findOne({ providerCode: game.providerCode }).lean();

    res.json({
      success: true,
      data: {
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
        provider: provider ? {
          provider_code: provider.providerCode,
          providerName: provider.providerName,
          gameType: provider.gameType
        } : { provider_code: game.providerCode }
      }
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid game ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/games/launch — Launch a game
router.post('/launch', async (req, res) => {
  try {
    const { username, game_code, provider_code, game_type, money } = req.body;

    // Validate required fields
    if (!username || !game_code || !provider_code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: username, game_code, provider_code' 
      });
    }

    // TODO: Integrate with external API (https://crazybet99.com/getgameurl/v2)
    // For now, return a mock URL or success response
    
    // Simulating external API call delay
    // await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      success: true,
      message: 'Game launch URL generated successfully',
      data: {
        gameUrl: `https://launcher.crazybet99.com/play?token=${Math.random().toString(36).substring(7)}`,
        game_code,
        provider_code
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
