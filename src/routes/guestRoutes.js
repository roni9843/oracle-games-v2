const express = require('express');
const router = express.Router();
const GuestUser = require('../models/GuestUser');

// POST /api/guests/session
// Start or resume a session
router.post('/session', async (req, res) => {
  try {
    const { whatsappNumber, telegramId } = req.body;

    if (!whatsappNumber) {
      return res.status(400).json({ success: false, message: 'WhatsApp number is required' });
    }

    let guest = await GuestUser.findOne({ whatsappNumber });
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

    if (guest) {
      if (guest.isRestricted) {
        return res.status(403).json({ success: false, message: 'Please contact support.' });
      }

      if (new Date() > guest.sessionEndsAt) {
          // expired
          return res.status(403).json({ success: false, message: 'Your 1-hour session has expired. Please contact support.' });
      }

      // If they gave a new telegram ID, update it
      if (telegramId && !guest.telegramId) {
          guest.telegramId = telegramId;
          await guest.save();
      }

      return res.json({ success: true, message: 'Session active', sessionEndsAt: guest.sessionEndsAt });
    }

    // New Guest
    guest = new GuestUser({
      whatsappNumber,
      telegramId: telegramId || '',
      sessionEndsAt: oneHourFromNow,
    });
    
    await guest.save();

    res.status(201).json({ 
        success: true, 
        message: '1-Hour session started. Enjoy!', 
        sessionEndsAt: guest.sessionEndsAt 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/guests/status/:whatsappNumber
// Check remaining time/status
router.get('/status/:whatsappNumber', async (req, res) => {
    try {
        const guest = await GuestUser.findOne({ whatsappNumber: req.params.whatsappNumber });
        
        if (!guest) {
            return res.status(404).json({ success: false, message: 'Session not found. Please register.' });
        }

        if (guest.isRestricted) {
            return res.json({ success: true, valid: false, message: 'Please contact support.' });
        }

        if (new Date() > guest.sessionEndsAt) {
            return res.json({ success: true, valid: false, message: 'Your 1-hour session has expired. Please contact support.' });
        }

        res.json({ success: true, valid: true, sessionEndsAt: guest.sessionEndsAt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
