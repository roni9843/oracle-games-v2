// 1. Sobar upore ei polyfill-ti thakte hobe (Node 18 compatibility fixed)
const { File } = require('node:buffer');
if (typeof global.File === 'undefined') {
    global.File = File;
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const apiKeyAuth = require('./src/middleware/apiKeyAuth');

// Import routes
const adminRoutes = require('./src/routes/adminRoutes'); // Jodi thake
const providerRoutes = require('./src/routes/providerRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const cricketRoutes = require('./src/routes/cricketRoutes');
const guestRoutes = require('./src/routes/guestRoutes');
const adminGuestRoutes = require('./src/routes/admin/adminGuestRoutes');

const app = express();

// --- Middleware ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-dstgame-key'],
  credentials: false
}));
app.options('*', cors()); // Handle preflight for all routes

app.use(express.json());

// --- Health check ---
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎮 Game Data API is running',
    version: '2.0',
    endpoints: {
      providers: '/api/providers',
      games: '/api/games',
      admin: '/api/admin/clients',
      cricket: '/api/cricket/matches'
    }
  });
});

// --- Routes ---

// Admin routes
app.use('/api/admin/clients', require('./src/routes/admin/clientRoutes'));
app.use('/api/admin/games', require('./src/routes/admin/gameRoutes'));
app.use('/api/admin/providers', require('./src/routes/admin/providerRoutes'));
app.use('/api/admin/guests', adminGuestRoutes);

// Public routes
app.use('/api/providers', providerRoutes);
app.use('/api/cricket', cricketRoutes);
app.use('/api/guests', guestRoutes);

// Protected routes (API key required)
app.use('/api/games', apiKeyAuth, gameRoutes);

// --- Error Handlers ---

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Database Connection
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Game API Server running on port ${PORT}`);
      console.log(`📋 Admin Panel: http://localhost:${PORT}/api/admin/clients`);
      console.log(`🎮 Providers: http://localhost:${PORT}/api/providers`);
      console.log(`🎰 Games: http://localhost:${PORT}/api/games`);
      console.log(`🏏 Cricket: http://localhost:${PORT}/api/cricket/matches\n`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();