// Notification stub system
// In a real application, this would integrate with push notification services,
// email services, or in-app notification systems

const logNotification = (type, data) => {
  console.log(`[NOTIFICATION] ${type}:`, JSON.stringify(data, null, 2));
};

const notifyReportResolved = async (report, authority) => {
  const notificationData = {
    type: 'REPORT_RESOLVED',
    reportId: report.id,
    reportTitle: report.title,
    authorId: report.authorId,
    authorityId: authority.id,
    authorityName: authority.username,
    resolvedAt: new Date().toISOString()
  };

  // Log the notification (in production, this would send actual notifications)
  logNotification('REPORT_RESOLVED', notificationData);

  // TODO: In a real application, you would:
  // 1. Store notification in database
  // 2. Send push notification to user's device
  // 3. Send email notification
  // 4. Add to in-app notification feed
  
  return notificationData;
};

const notifyReportStatusChange = async (report, newStatus, authority) => {
  const notificationData = {
    type: 'REPORT_STATUS_CHANGE',
    reportId: report.id,
    reportTitle: report.title,
    authorId: report.authorId,
    newStatus,
    authorityId: authority.id,
    authorityName: authority.username,
    changedAt: new Date().toISOString()
  };

  logNotification('REPORT_STATUS_CHANGE', notificationData);
  return notificationData;
};

const notifyReportClosed = async (report) => {
  const notificationData = {
    type: 'REPORT_CLOSED',
    reportId: report.id,
    reportTitle: report.title,
    authorId: report.authorId,
    closedAt: new Date().toISOString()
  };

  logNotification('REPORT_CLOSED', notificationData);
  return notificationData;
};

module.exports = {
  notifyReportResolved,
  notifyReportStatusChange,
  notifyReportClosed
};
