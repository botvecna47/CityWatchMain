const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount: getUnreadCount,
} = require('../services/notificationService');

/**
 * Get user's notifications with pagination
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const offset = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    };

    const result = await getUserNotifications(userId, parseInt(limit), parseInt(offset));

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Mark a specific notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await markNotificationAsRead(id, userId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Mark all notifications as read for the user
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllNotificationsAsRead(userId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get unread notification count for the user
 */
const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUnreadCount(userId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ count: result.count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationCount
};
