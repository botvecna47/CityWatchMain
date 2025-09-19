const prisma = require('./database');

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to notify
 * @param {string} type - The notification type (status_change, new_comment, report_resolved, authority_update)
 * @param {string} message - The notification message
 * @param {string} reportId - Optional report ID for context
 */
const createNotification = async (userId, type, message, reportId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        reportId
      },
    });

    console.log(
      `Notification created for user ${userId}: ${type} - ${message}`
    );
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {string[]} userIds - Array of user IDs to notify
 * @param {string} type - The notification type
 * @param {string} message - The notification message
 * @param {string} reportId - Optional report ID for context
 */
const createNotificationsForUsers = async (
  userIds,
  type,
  message,
  reportId = null
) => {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        createNotification(userId, type, message, reportId)
      )
    );

    console.log(
      `Notifications created for ${userIds.length} users: ${type} - ${message}`
    );
    return notifications;
  } catch (error) {
    console.error('Error creating notifications for users:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options (limit, offset, unreadOnly)
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark notifications as read
 * @param {string} userId - The user ID
 * @param {string[]} notificationIds - Array of notification IDs to mark as read (empty array = mark all)
 */
const markNotificationsAsRead = async (userId, notificationIds = []) => {
  try {
    const where = { userId };
    if (notificationIds.length > 0) {
      where.id = { in: notificationIds };
    }

    const result = await prisma.notification.updateMany({
      where,
      data: { isRead: true }
    });

    console.log(
      `Marked ${result.count} notifications as read for user ${userId}`
    );
    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - The user ID
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * Get all users who have commented on a report (excluding the author)
 * @param {string} reportId - The report ID
 * @param {string} excludeUserId - User ID to exclude from results
 */
const getReportCommenters = async (reportId, excludeUserId = null) => {
  try {
    const where = { reportId };
    if (excludeUserId) {
      where.authorId = { not: excludeUserId };
    }

    const comments = await prisma.comment.findMany({
      where,
      select: { authorId: true },
      distinct: ['authorId']
    });

    return comments.map((comment) => comment.authorId);
  } catch (error) {
    console.error('Error getting report commenters:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createNotificationsForUsers,
  getUserNotifications,
  markNotificationsAsRead,
  getUnreadCount,
  getReportCommenters
};
