const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, getUnreadCount } = require('../controllers/notificationsController');
const authMiddleware = require('../middleware/auth');

// All notification routes require authentication
router.use(authMiddleware);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications);

// POST /api/notifications/mark-read - Mark notifications as read
router.post('/mark-read', markAsRead);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

module.exports = router;
