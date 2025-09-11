const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationCount,
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticateToken);

// GET /api/notifications - Get user's notifications with pagination
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadNotificationCount);

// PATCH /api/notifications/:id/read - Mark a single notification as read
router.patch('/:id/read', markAsRead);

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', markAllAsRead);

module.exports = router;