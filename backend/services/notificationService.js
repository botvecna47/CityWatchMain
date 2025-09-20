const prisma = require('./database');
const { 
  sendAlertNotification, 
  sendEventNotification, 
  sendEventApprovalNotification 
} = require('../utils/mailer');

// Create notification and send email for alerts
const createAlertNotification = async (alertId, cityId) => {
  try {
    // Get the alert details
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { city: true }
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    // Get all users in the city
    const users = await prisma.user.findMany({
      where: { 
        cityId: cityId,
        isBanned: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        isEmailVerified: true
      }
    });

    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'ALERT',
      message: `New alert: ${alert.title}`,
      link: `/alerts/${alertId}`,
      alertId: alertId
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    // Send emails to verified users
    const emailPromises = users
      .filter(user => user.isEmailVerified && user.email)
      .map(async (user) => {
        try {
          const result = await sendAlertNotification(
            user.email,
            user.firstName,
            alert.title,
            alert.message,
            alert.city.name
          );
          
          if (!result.success) {
            console.warn(`Failed to send alert email to ${user.email}:`, result.error);
          }
        } catch (error) {
          console.error(`Error sending alert email to ${user.email}:`, error);
        }
      });

    await Promise.allSettled(emailPromises);

    console.log(`✅ Alert notifications created for ${users.length} users in ${alert.city.name}`);
    return { success: true, userCount: users.length };

  } catch (error) {
    console.error('Error creating alert notifications:', error);
    return { success: false, error: error.message };
  }
};

// Create notification and send email for events
const createEventNotification = async (eventId) => {
  try {
    // Get the event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        city: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Get all users in the city
    const users = await prisma.user.findMany({
      where: { 
        cityId: event.cityId,
        isBanned: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        isEmailVerified: true
      }
    });

    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'EVENT',
      message: `New event: ${event.title}`,
      link: `/events/${eventId}`,
      eventId: eventId
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    // Send emails to verified users
    const emailPromises = users
      .filter(user => user.isEmailVerified && user.email)
      .map(async (user) => {
        try {
          const result = await sendEventNotification(
            user.email,
            user.firstName,
            event.title,
            event.description,
            event.dateTime,
            event.location,
            event.city.name
          );
          
          if (!result.success) {
            console.warn(`Failed to send event email to ${user.email}:`, result.error);
          }
        } catch (error) {
          console.error(`Error sending event email to ${user.email}:`, error);
        }
      });

    await Promise.allSettled(emailPromises);

    console.log(`✅ Event notifications created for ${users.length} users in ${event.city.name}`);
    return { success: true, userCount: users.length };

  } catch (error) {
    console.error('Error creating event notifications:', error);
    return { success: false, error: error.message };
  }
};

// Create notification for event approval/rejection
const createEventApprovalNotification = async (eventId, status, rejectionReason = null) => {
  try {
    // Get the event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            isEmailVerified: true
          }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Create notification for the event creator
    await prisma.notification.create({
      data: {
        userId: event.creator.id,
        type: 'EVENT_APPROVAL',
        message: `Your event "${event.title}" has been ${status.toLowerCase()}`,
        link: `/events/${eventId}`,
        eventId: eventId
      }
    });

    // Send email to the event creator if they have verified email
    if (event.creator.isEmailVerified && event.creator.email) {
      try {
        const result = await sendEventApprovalNotification(
          event.creator.email,
          event.creator.firstName,
          event.title,
          status,
          rejectionReason
        );
        
        if (!result.success) {
          console.warn(`Failed to send event approval email to ${event.creator.email}:`, result.error);
        }
      } catch (error) {
        console.error(`Error sending event approval email to ${event.creator.email}:`, error);
      }
    }

    console.log(`✅ Event approval notification created for event creator`);
    return { success: true };

  } catch (error) {
    console.error('Error creating event approval notification:', error);
    return { success: false, error: error.message };
  }
};

// Get notifications for a user
const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        Alert: {
          select: {
            id: true,
            title: true,
            message: true
          }
        },
        Event: {
          select: {
            id: true,
            title: true,
            description: true,
            dateTime: true,
            location: true
          }
        }
      }
    });

    const totalCount = await prisma.notification.count({
      where: { userId }
    });

    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        isRead: false
      }
    });

    return {
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount,
        hasMore: offset + notifications.length < totalCount
      }
    };

  } catch (error) {
    console.error('Error getting user notifications:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId
      },
      data: {
        isRead: true
      }
    });

    return { success: true, updated: notification.count > 0 };

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return { success: true, updated: result.count };

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notification count for a user
const getUnreadNotificationCount = async (userId) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    return {
      success: true,
      count: unreadCount
    };

  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

// Notify authorities about new reports
const notifyAuthoritiesOfNewReport = async (cityId, reportId, reportTitle, authorUsername) => {
  try {
    // Get all authority users in the city
    const authorities = await prisma.user.findMany({
      where: { 
        cityId: cityId,
        role: 'authority',
        isBanned: false
      },
      select: {
        id: true,
        username: true,
        email: true,
        isEmailVerified: true
      }
    });

    if (authorities.length === 0) {
      console.log(`No authorities found in city ${cityId} to notify about new report`);
      return;
    }

    // Create notifications for all authorities
    const notifications = authorities.map(authority => ({
      userId: authority.id,
      type: 'NEW_REPORT',
      message: `New report: "${reportTitle}" by ${authorUsername}`,
      link: `/reports/${reportId}`,
      reportId: reportId
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    console.log(`Created ${notifications.length} notifications for authorities about new report: ${reportTitle}`);

  } catch (error) {
    console.error('Error notifying authorities of new report:', error);
    throw error;
  }
};

// Notify authority update to report author
const notifyAuthorityUpdate = async (reportId, authorityUsername, reportTitle, authorityId) => {
  try {
    // Get the report author
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        authorId: true,
        author: {
          select: {
            username: true,
            email: true,
            isEmailVerified: true
          }
        }
      }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Create notification for report author
    await prisma.notification.create({
      data: {
        userId: report.authorId,
        type: 'AUTHORITY_UPDATE',
        message: `Authority ${authorityUsername} updated report: "${reportTitle}"`,
        link: `/reports/${reportId}`,
        reportId: reportId
      }
    });

    console.log(`Notified report author ${report.author.username} about authority update`);

  } catch (error) {
    console.error('Error notifying authority update:', error);
    throw error;
  }
};

// Notify when report is closed
const notifyReportClosed = async (reportId, reportTitle, closedBy) => {
  try {
    // Get the report author
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        authorId: true,
        author: {
          select: {
            username: true,
            email: true,
            isEmailVerified: true
          }
        }
      }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Create notification for report author
    await prisma.notification.create({
      data: {
        userId: report.authorId,
        type: 'REPORT_CLOSED',
        message: `Report "${reportTitle}" has been closed by ${closedBy}`,
        link: `/reports/${reportId}`,
        reportId: reportId
      }
    });

    console.log(`Notified report author ${report.author.username} about report closure`);

  } catch (error) {
    console.error('Error notifying report closure:', error);
    throw error;
  }
};

module.exports = {
  createAlertNotification,
  createEventNotification,
  createEventApprovalNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  notifyAuthoritiesOfNewReport,
  notifyAuthorityUpdate,
  notifyReportClosed,
};