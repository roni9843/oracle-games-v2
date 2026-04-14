const express = require('express');
const router = express.Router();
const Provider = require('../../models/Provider');

// GET /api/admin/providers — List all providers
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find({}).sort({ providerName: 1 });
    res.json({ success: true, count: providers.length, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/providers — Create provider
router.post('/', async (req, res) => {
  try {
    const { providerCode, providerName, gameType } = req.body;
    
    if (!providerCode || !providerName || !gameType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const exists = await Provider.findOne({ providerCode });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Provider code already exists' });
    }

    const provider = new Provider(req.body);
    await provider.save();
    res.status(201).json({ success: true, message: 'Provider created successfully', data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/providers/:id — Update provider
router.put('/:id', async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, message: 'Provider updated successfully', data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/providers/:id — Delete provider
router.delete('/:id', async (req, res) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
