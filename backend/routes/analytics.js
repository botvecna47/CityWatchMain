const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');

// Public stats (no authentication required)
router.get('/public/stats', analyticsController.getPublicStats);

// All other analytics routes require authentication
router.use(authMiddleware);

// Dashboard statistics (admin only)
router.get('/dashboard', requireAdmin, analyticsController.getDashboardStats);

// User analytics (admin only)
router.get('/users', requireAdmin, analyticsController.getUserAnalytics);

// Report analytics (admin only)
router.get('/reports', requireAdmin, analyticsController.getReportAnalytics);

// Event analytics (admin only)
router.get('/events', requireAdmin, analyticsController.getEventAnalytics);

// Alert analytics (admin only)
router.get('/alerts', requireAdmin, analyticsController.getAlertAnalytics);

// Authority dashboard stats (accessible by authority users)
router.get('/authority/dashboard', analyticsController.getAuthorityDashboardStats);

module.exports = router;
