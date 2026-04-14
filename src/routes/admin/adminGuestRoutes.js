const express = require('express');
const router = express.Router();
const GuestUser = require('../../models/GuestUser');

// GET /api/admin/guests — List all guest users
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { whatsappNumber: { $regex: search, $options: 'i' } },
        { telegramId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await GuestUser.countDocuments(filter);
    const guests = await GuestUser.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: guests,
      count: total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/guests/:id/unrestrict
router.patch('/:id/unrestrict', async (req, res) => {
  try {
    const guest = await GuestUser.findById(req.params.id);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
    
    // Grant another 1 hour
    guest.isRestricted = false;
    guest.sessionEndsAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await guest.save();
    res.json({ success: true, message: 'User unrestricted. Granted 1 more hour.', data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/guests/:id/restrict
router.patch('/:id/restrict', async (req, res) => {
    try {
      const guest = await GuestUser.findById(req.params.id);
      if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
      
      guest.isRestricted = true;
      // Also expire their session immediately
      guest.sessionEndsAt = new Date();
      
      await guest.save();
      res.json({ success: true, message: 'User restricted successfully.', data: guest });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
