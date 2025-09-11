const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} = require('../services/notificationService');

/**
 * Get user's notifications with pagination
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.',
      });
    }

    const result = await getUserNotifications(userId, page, limit, unreadOnly);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
    });
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({
        error: 'Notification ID is required',
      });
    }

    const result = await markNotificationAsRead(id, userId);

    if (result.count === 0) {
      return res.status(404).json({
        error: 'Notification not found or already marked as read',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
    });
  }
};

/**
 * Mark all notifications as read for the current user
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
    });
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await getUnreadCount(userId);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationCount,
};
