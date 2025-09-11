const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to notify
 * @param {string} type - Notification type (REPORT_CREATED, COMMENT_ADDED, REPORT_UPDATED, REPORT_CLOSED)
 * @param {string} message - The notification message
 * @param {string} link - Optional link to related content
 * @param {string} reportId - Optional report ID reference
 */
const createNotification = async (userId, type, message, link = null, reportId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
        reportId,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {string[]} userIds - Array of user IDs to notify
 * @param {string} type - Notification type
 * @param {string} message - The notification message
 * @param {string} link - Optional link to related content
 * @param {string} reportId - Optional report ID reference
 */
const createBulkNotifications = async (userIds, type, message, link = null, reportId = null) => {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type,
        message,
        link,
        reportId,
      })),
    });
    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Notify all authorities in a city when a new report is created
 * @param {string} cityId - The city ID
 * @param {string} reportId - The report ID
 * @param {string} reportTitle - The report title
 * @param {string} authorUsername - The report author's username
 */
const notifyAuthoritiesOfNewReport = async (cityId, reportId, reportTitle, authorUsername) => {
  try {
    // Get all authorities in the city
    const authorities = await prisma.user.findMany({
      where: {
        cityId,
        role: 'authority',
        isBanned: false,
      },
      select: { id: true },
    });

    if (authorities.length === 0) return;

    const userIds = authorities.map(auth => auth.id);
    const message = `New report "${reportTitle}" created by ${authorUsername}`;
    const link = `/reports/${reportId}`;

    await createBulkNotifications(userIds, 'REPORT_CREATED', message, link, reportId);
  } catch (error) {
    console.error('Error notifying authorities of new report:', error);
  }
};

/**
 * Notify report author and commenters when a new comment is added
 * @param {string} reportId - The report ID
 * @param {string} commenterUsername - The commenter's username
 * @param {string} reportTitle - The report title
 * @param {string} commenterId - The commenter's ID (to exclude from notifications)
 */
const notifyCommentAdded = async (reportId, commenterUsername, reportTitle, commenterId) => {
  try {
    // Get report author
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { authorId: true },
    });

    if (!report) return;

    // Get all unique commenters (excluding the new commenter)
    const commenters = await prisma.comment.findMany({
      where: { reportId },
      select: { authorId: true },
      distinct: ['authorId'],
    });

    const userIds = new Set();
    
    // Add report author (if not the commenter)
    if (report.authorId !== commenterId) {
      userIds.add(report.authorId);
    }

    // Add other commenters (excluding the new commenter)
    commenters.forEach(comment => {
      if (comment.authorId !== commenterId) {
        userIds.add(comment.authorId);
      }
    });

    if (userIds.size === 0) return;

    const message = `${commenterUsername} commented on "${reportTitle}"`;
    const link = `/reports/${reportId}`;

    await createBulkNotifications(Array.from(userIds), 'COMMENT_ADDED', message, link, reportId);
  } catch (error) {
    console.error('Error notifying comment added:', error);
  }
};

/**
 * Notify report author when authority adds an update
 * @param {string} reportId - The report ID
 * @param {string} authorityUsername - The authority's username
 * @param {string} reportTitle - The report title
 * @param {string} authorityId - The authority's ID
 */
const notifyAuthorityUpdate = async (reportId, authorityUsername, reportTitle, authorityId) => {
  try {
    // Get report author
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { authorId: true },
    });

    if (!report) return;

    // Don't notify if the authority is also the report author
    if (report.authorId === authorityId) return;

    const message = `${authorityUsername} updated "${reportTitle}"`;
    const link = `/reports/${reportId}`;

    await createNotification(report.authorId, 'REPORT_UPDATED', message, link, reportId);
  } catch (error) {
    console.error('Error notifying authority update:', error);
  }
};

/**
 * Notify report author when report is closed
 * @param {string} reportId - The report ID
 * @param {string} reportTitle - The report title
 * @param {string} authorId - The report author's ID
 */
const notifyReportClosed = async (reportId, reportTitle, authorId) => {
  try {
    const message = `Your report "${reportTitle}" has been closed`;
    const link = `/reports/${reportId}`;

    await createNotification(authorId, 'REPORT_CLOSED', message, link, reportId);
  } catch (error) {
    console.error('Error notifying report closed:', error);
  }
};

/**
 * Get user's notifications with pagination
 * @param {string} userId - The user ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @param {boolean} unreadOnly - Only return unread notifications (default: false)
 */
const getUserNotifications = async (userId, page = 1, limit = 20, unreadOnly = false) => {
  try {
    const skip = (page - 1) * limit;
    
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 * @param {string} userId - The user ID (for security)
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user can only mark their own notifications as read
      },
      data: { isRead: true },
    });
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The user ID
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
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
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyAuthoritiesOfNewReport,
  notifyCommentAdded,
  notifyAuthorityUpdate,
  notifyReportClosed,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
};
