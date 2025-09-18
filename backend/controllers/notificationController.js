const { 
  getUserNotifications, 
  markNotificationsAsRead, 
  getUnreadCount 
} = require('../services/notifications');

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

    const notifications = await getUserNotifications(userId, options);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: notifications.length === parseInt(limit)
      }
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

    await markNotificationsAsRead(userId, [id]);

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

    await markNotificationsAsRead(userId, []);

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

    const count = await getUnreadCount(userId);

    res.json({ unreadCount: count });
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
