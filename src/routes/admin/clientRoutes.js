const express = require('express');
const router = express.Router();
const ApiClient = require('../../models/ApiClient');

// POST /api/admin/clients — Create new client
router.post('/', async (req, res) => {
  try {
    const { username, description } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const exists = await ApiClient.findOne({ username });
    if (exists) return res.status(400).json({ success: false, message: 'Username already exists' });

    const client = new ApiClient({ username, description });
    await client.save();
    res.status(201).json({ success: true, message: 'Client created', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/clients — List all clients
router.get('/', async (req, res) => {
  try {
    const clients = await ApiClient.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/clients/:id — Single client
router.get('/:id', async (req, res) => {
  try {
    const client = await ApiClient.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/clients/:id — Update client
router.put('/:id', async (req, res) => {
  try {
    const { username, description, isEnabled } = req.body;
    const client = await ApiClient.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    if (username !== undefined) client.username = username;
    if (description !== undefined) client.description = description;
    if (isEnabled !== undefined) client.isEnabled = isEnabled;

    await client.save();
    res.json({ success: true, message: 'Client updated', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/clients/:id — Delete client
router.delete('/:id', async (req, res) => {
  try {
    const client = await ApiClient.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/clients/:id/regenerate — Regenerate API key
router.post('/:id/regenerate', async (req, res) => {
  try {
    const client = await ApiClient.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    await client.regenerateKey();
    res.json({ success: true, message: 'API key regenerated', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
