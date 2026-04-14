const express = require('express');
const router  = express.Router();
const Game    = require('../../models/Game');
const axios   = require('axios');
const qs      = require('qs');

// ─────────────────────────────────────────
// POST /api/admin/games/launch
// Proxy → crazybet99.com/getgameurl/v2  (API key lives in server .env)
// ─────────────────────────────────────────
router.post('/launch', async (req, res) => {
  try {
    const { username, money, provider_code, game_code, game_type } = req.body;


    console.log('[Game Launch Request]', { username, money, provider_code, game_code, game_type });


    if (!username || !provider_code) {
      return res.status(400).json({
        success: false,
        message: 'username and provider_code are required',
      });
    }

    const API_KEY = process.env.DST_GAME_KEY;
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Game API key not configured on server',
      });
    }

    const payload = {
     username,
      money:  50,
      provider_code,
      game_code: game_code || 0,
      game_type: game_type || 0,
    };



    const response = await axios.post(
      'https://crazybet99.com/getgameurl/v2',
      qs.stringify(payload),          // encode as x-www-form-urlencoded
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-dstgame-key': "517f864fa4585d20036cbe27230d78eb",
        },
      }
    );

  

    return res.status(200).json({
      success: true,
      url: response?.data,
    });

  } catch (error) {
    const errData = error.response?.data;
    console.error('[Game Launch Error]', errData || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: errData?.message || error.message || 'Game launch failed',
      ...(errData || {}),
    });
  }
});

// GET /api/admin/games — List games with pagination & search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const providerCode = req.query.providerCode || '';
    const gameType = req.query.gameType || '';
    const popular = req.query.popular === 'true';
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { gameName: { $regex: search, $options: 'i' } },
        { gameCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (providerCode) filter.providerCode = providerCode;
    if (gameType)     filter.gameType = gameType;
    if (popular)      filter.popular = true;

    const total = await Game.countDocuments(filter);
    const games = await Game.find(filter)
      .sort({ popular: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: games,
      count: total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/games — Create new game
router.post('/', async (req, res) => {
  try {
    const { gameCode, gameName, providerCode, gameType } = req.body;
    
    // Basic validation
    if (gameCode === undefined || gameCode === null || !gameName || !providerCode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // const exists = await Game.findOne({ gameCode });
    // if (exists) {
    //   return res.status(400).json({ success: false, message: 'Game code already exists' });
    // }

    const game = new Game(req.body);
    await game.save();
    res.status(201).json({ success: true, message: 'Game created successfully', data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/games/:id — Update game
router.put('/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    res.json({ success: true, message: 'Game updated successfully', data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/games/:id — Delete game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    res.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/games/:id/toggle-popular — Toggle popular flag
router.patch('/:id/toggle-popular', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    game.popular = !game.popular;
    await game.save();
    res.json({ success: true, popular: game.popular });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
