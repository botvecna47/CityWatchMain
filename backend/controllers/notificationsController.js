const notificationService = require('../services/notificationService');

// Get notifications for the current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;
    
    const page = Math.floor(parseInt(offset) / parseInt(limit)) + 1;
    const notifications = await notificationService.getUserNotifications(
      userId, 
      page, 
      parseInt(limit), 
      unreadOnly === 'true'
    );
    
    res.json({ 
      data: {
        notifications: notifications.notifications,
        total: notifications.total,
        totalPages: notifications.totalPages,
        page: notifications.page,
        limit: notifications.limit
      }
    });
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
    
    let result;
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      result = await Promise.all(
        notificationIds.map(id => 
          notificationService.markNotificationAsRead(id, userId)
        )
      );
      result = { count: result.length };
    } else {
      // Mark all notifications as read
      result = await notificationService.markAllNotificationsAsRead(userId);
    }
    
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
