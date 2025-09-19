const prisma = require('./database');
const {
  createNotification,
  createNotificationsForUsers,
} = require('./notifications');

/**
 * Notify authorities when a new report is created
 * @param {string} cityId - The city ID where the report was created
 * @param {string} reportId - The report ID
 * @param {string} reportTitle - The report title
 * @param {string} authorUsername - The username of the report author
 */
const notifyAuthoritiesOfNewReport = async(
  cityId,
  reportId,
  reportTitle,
  authorUsername
) => {
  try {
    // Get all authority users in the same city
    const authorities = await prisma.user.findMany({
      where: {
        cityId: cityId,
        role: 'authority',
      },
      select: { id: true },
    });

    if (authorities.length === 0) {
      console.log(`No authorities found for city ${cityId}`);
      return;
    }

    const authorityIds = authorities.map((auth) => auth.id);
    const message = `New report "${reportTitle}" created by ${authorUsername}`;

    await createNotificationsForUsers(
      authorityIds,
      'new_report',
      message,
      reportId
    );

    console.log(
      `Notified ${authorityIds.length} authorities about new report ${reportId}`
    );
  } catch (error) {
    console.error('Error notifying authorities of new report:', error);
    throw error;
  }
};

/**
 * Notify report author when an authority provides an update
 * @param {string} reportId - The report ID
 * @param {string} authorityUsername - The username of the authority
 * @param {string} reportTitle - The report title
 * @param {string} authorityId - The authority user ID
 */
const notifyAuthorityUpdate = async(
  reportId,
  authorityUsername,
  reportTitle
) => {
  try {
    // Get the report author
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { authorId: true },
    });

    if (!report) {
      console.log(`Report ${reportId} not found`);
      return;
    }

    const message = `Authority ${authorityUsername} provided an update on your report "${reportTitle}"`;

    await createNotification(
      report.authorId,
      'authority_update',
      message,
      reportId
    );

    console.log(
      `Notified report author about authority update for report ${reportId}`
    );
  } catch (error) {
    console.error('Error notifying authority update:', error);
    throw error;
  }
};

/**
 * Notify report author when a report is closed/resolved
 * @param {string} reportId - The report ID
 * @param {string} reportTitle - The report title
 * @param {string} userId - The user ID who closed the report
 */
const notifyReportClosed = async(reportId, reportTitle, userId) => {
  try {
    // Get the report author
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { authorId: true },
    });

    if (!report) {
      console.log(`Report ${reportId} not found`);
      return;
    }

    // Don't notify if the author is the one who closed it
    if (report.authorId === userId) {
      console.log(
        `Report author closed their own report ${reportId}, no notification needed`
      );
      return;
    }

    const message = `Your report "${reportTitle}" has been resolved`;

    await createNotification(
      report.authorId,
      'report_resolved',
      message,
      reportId
    );

    console.log(
      `Notified report author about report closure for report ${reportId}`
    );
  } catch (error) {
    console.error('Error notifying report closure:', error);
    throw error;
  }
};

/**
 * Notify all users in a city when a new alert is created
 * @param {string} cityId - The city ID where the alert was created
 * @param {string} alertId - The alert ID
 * @param {string} alertTitle - The alert title
 * @param {string} creatorUsername - The username of the alert creator
 */
const notifyAlertCreated = async(
  cityId,
  alertId,
  alertTitle,
  creatorUsername
) => {
  try {
    // Get all users in the same city
    const users = await prisma.user.findMany({
      where: {
        cityId: cityId,
      },
      select: { id: true },
    });

    if (users.length === 0) {
      console.log(`No users found for city ${cityId}`);
      return;
    }

    const userIds = users.map((user) => user.id);
    const message = `New alert: "${alertTitle}" posted by ${creatorUsername}`;

    await createNotificationsForUsers(
      userIds,
      'ALERT_CREATED',
      message,
      null,
      alertId
    );

    console.log(
      `Notified ${userIds.length} users about new alert ${alertId}`
    );
  } catch (error) {
    console.error('Error notifying users of new alert:', error);
    throw error;
  }
};

/**
 * Notify all users in a city when a new event is created
 * @param {string} cityId - The city ID where the event was created
 * @param {string} eventId - The event ID
 * @param {string} eventTitle - The event title
 * @param {string} creatorUsername - The username of the event creator
 */
const notifyEventCreated = async(
  cityId,
  eventId,
  eventTitle,
  creatorUsername
) => {
  try {
    // Get all users in the same city
    const users = await prisma.user.findMany({
      where: {
        cityId: cityId,
      },
      select: { id: true },
    });

    if (users.length === 0) {
      console.log(`No users found for city ${cityId}`);
      return;
    }

    const userIds = users.map((user) => user.id);
    const message = `New event: "${eventTitle}" posted by ${creatorUsername}`;

    await createNotificationsForUsers(
      userIds,
      'EVENT_CREATED',
      message,
      null,
      null
    );

    console.log(
      `Notified ${userIds.length} users about new event ${eventId}`
    );
  } catch (error) {
    console.error('Error notifying users of new event:', error);
    throw error;
  }
};

module.exports = {
  notifyAuthoritiesOfNewReport,
  notifyAuthorityUpdate,
  notifyReportClosed,
  notifyAlertCreated,
  notifyEventCreated,
};
