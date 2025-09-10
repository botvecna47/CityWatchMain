const notificationService = require('../services/notifications');

// Get notifications for the current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;
    
    // If notificationIds is provided, mark specific notifications as read
    // If not provided, mark all notifications as read
    const result = await notificationService.markNotificationsAsRead(
      userId, 
      notificationIds || []
    );
    
    res.json({ 
      message: 'Notifications marked as read',
      count: result.count
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  getUnreadCount
};
