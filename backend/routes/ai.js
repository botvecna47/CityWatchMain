const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  chat,
  getCityUpdates,
  getSuggestions,
  getHelp,
  getStatus,
  analyzeReportAuthority
} = require('../controllers/aiController');

// Apply rate limiting to all AI routes
router.use(apiLimiter);

// Apply authentication to all AI routes
router.use(authMiddleware);

// Chat with AI assistant
router.post('/chat', chat);

// Get city updates
router.get('/city-updates', getCityUpdates);

// Get smart suggestions
router.get('/suggestions', getSuggestions);

// Get help information
router.get('/help', getHelp);

// Get AI status (public endpoint for health checks)
router.get('/status', getStatus);

// Analyze report content to determine appropriate authority type
router.post('/analyze-report-authority', analyzeReportAuthority);

module.exports = router;
