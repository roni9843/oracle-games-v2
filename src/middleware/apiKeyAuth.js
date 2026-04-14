const ApiClient = require('../models/ApiClient');

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required. Please provide x-api-key header.'
    });
  }

  try {
    const client = await ApiClient.findOne({ apiKey });

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }

    if (!client.isEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Your API access has been disabled. Contact admin.'
      });
    }

    // Attach client info to request
    req.apiClient = client;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

module.exports = apiKeyAuth;
