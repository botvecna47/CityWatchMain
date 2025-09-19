const prisma = require('../services/database');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalReports,
      totalCities,
      totalEvents,
      totalAlerts,
      activeReports,
      resolvedReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count(),
      prisma.city.count(),
      prisma.event.count(),
      prisma.alert.count({ where: { deleted: false } }),
      prisma.report.count({ where: { status: 'OPEN' } }),
      prisma.report.count({ where: { status: 'RESOLVED' } })
    ]);

    // Calculate average resolution time
    const resolvedReportsWithTime = await prisma.report.findMany({
      where: { 
        status: 'RESOLVED'
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const avgResolutionTime = resolvedReportsWithTime.length > 0
      ? resolvedReportsWithTime.reduce((sum, report) => {
          const created = new Date(report.createdAt);
          const resolved = new Date(report.updatedAt);
          return sum + (resolved - created) / (1000 * 60 * 60 * 24); // days
        }, 0) / resolvedReportsWithTime.length
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalReports,
        totalCities,
        totalEvents,
        totalAlerts,
        activeReports,
        resolvedReports,
        avgResolutionTime: Math.round(avgResolutionTime)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    // Users by city
    const usersByCity = await prisma.user.groupBy({
      by: ['cityId'],
      _count: {
        cityId: true
      }
    });

    // Get city names for the grouped data
    const cityIds = usersByCity.map(item => item.cityId);
    const cities = await prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true }
    });

    // Verified and banned users
    const [verifiedUsers, bannedUsers] = await Promise.all([
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { isBanned: true } })
    ]);

    // Users over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersOverTime = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const usersByDate = {};
    usersOverTime.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    // Fill missing dates with 0
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        count: usersByDate[dateStr] || 0
      });
    }

    res.json({
      success: true,
      data: {
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {}),
        byCity: usersByCity.reduce((acc, item) => {
          const city = cities.find(c => c.id === item.cityId);
          acc[city?.name || 'Unknown'] = item._count.cityId;
          return acc;
        }, {}),
        verified: verifiedUsers,
        banned: bannedUsers,
        overTime: last30Days
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
};

// Get report analytics
const getReportAnalytics = async (req, res) => {
  try {
    // Reports by status
    const reportsByStatus = await prisma.report.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Reports by category
    const reportsByCategory = await prisma.report.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    // Reports by city
    const reportsByCity = await prisma.report.groupBy({
      by: ['cityId'],
      _count: {
        cityId: true
      }
    });

    // Get city names for reports
    const reportCityIds = reportsByCity.map(item => item.cityId);
    const reportCities = await prisma.city.findMany({
      where: { id: { in: reportCityIds } },
      select: { id: true, name: true }
    });

    // Reports over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reportsOverTime = await prisma.report.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const reportsByDate = {};
    reportsOverTime.forEach(report => {
      const date = report.createdAt.toISOString().split('T')[0];
      reportsByDate[date] = (reportsByDate[date] || 0) + 1;
    });

    // Fill missing dates with 0
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        count: reportsByDate[dateStr] || 0
      });
    }

    res.json({
      success: true,
      data: {
        byStatus: reportsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        byCategory: reportsByCategory.reduce((acc, item) => {
          acc[item.category] = item._count.category;
          return acc;
        }, {}),
        byCity: reportsByCity.reduce((acc, item) => {
          const city = reportCities.find(c => c.id === item.cityId);
          acc[city?.name || 'Unknown'] = item._count.cityId;
          return acc;
        }, {}),
        overTime: last30Days
      }
    });
  } catch (error) {
    console.error('Error fetching report analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report analytics'
    });
  }
};

// Get event analytics
const getEventAnalytics = async (req, res) => {
  try {
    // Events by city
    const eventsByCity = await prisma.event.groupBy({
      by: ['cityId'],
      _count: {
        cityId: true
      }
    });

    // Get city names for events
    const eventCityIds = eventsByCity.map(item => item.cityId);
    const eventCities = await prisma.city.findMany({
      where: { id: { in: eventCityIds } },
      select: { id: true, name: true }
    });

    // Upcoming events
    const upcomingEvents = await prisma.event.count({
      where: {
        dateTime: {
          gte: new Date()
        }
      }
    });

    // Past events
    const pastEvents = await prisma.event.count({
      where: {
        dateTime: {
          lt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        total: await prisma.event.count(),
        upcoming: upcomingEvents,
        past: pastEvents,
        byCity: eventsByCity.reduce((acc, item) => {
          const city = eventCities.find(c => c.id === item.cityId);
          acc[city?.name || 'Unknown'] = item._count.cityId;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event analytics'
    });
  }
};

// Get alert analytics
const getAlertAnalytics = async (req, res) => {
  try {
    // Active alerts
    const activeAlerts = await prisma.alert.count({
      where: { deleted: false }
    });

    // Pinned alerts
    const pinnedAlerts = await prisma.alert.count({
      where: { 
        deleted: false,
        isPinned: true 
      }
    });

    // Alerts by city
    const alertsByCity = await prisma.alert.groupBy({
      by: ['cityId'],
      _count: {
        cityId: true
      },
      where: { deleted: false }
    });

    // Get city names for alerts
    const alertCityIds = alertsByCity.map(item => item.cityId);
    const alertCities = await prisma.city.findMany({
      where: { id: { in: alertCityIds } },
      select: { id: true, name: true }
    });

    res.json({
      success: true,
      data: {
        total: activeAlerts,
        pinned: pinnedAlerts,
        byCity: alertsByCity.reduce((acc, item) => {
          const city = alertCities.find(c => c.id === item.cityId);
          acc[city?.name || 'Unknown'] = item._count.cityId;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching alert analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert analytics'
    });
  }
};

// Authority dashboard stats (filtered by city)
const getAuthorityDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's city
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cityId: true }
    });

    if (!user.cityId) {
      return res.json({
        success: true,
        data: {
          totalReports: 0,
          openReports: 0,
          inProgressReports: 0,
          resolvedReports: 0,
          totalEvents: 0,
          totalAlerts: 0,
          activeAlerts: 0
        }
      });
    }

    const [
      totalReports,
      openReports,
      inProgressReports,
      resolvedReports,
      totalEvents,
      totalAlerts,
      activeAlerts
    ] = await Promise.all([
      prisma.report.count({ where: { cityId: user.cityId } }),
      prisma.report.count({ where: { cityId: user.cityId, status: 'OPEN' } }),
      prisma.report.count({ where: { cityId: user.cityId, status: 'IN_PROGRESS' } }),
      prisma.report.count({ where: { cityId: user.cityId, status: 'RESOLVED' } }),
      prisma.event.count({ where: { cityId: user.cityId } }),
      prisma.alert.count({ where: { cityId: user.cityId, deleted: false } }),
      prisma.alert.count({ where: { cityId: user.cityId, deleted: false } }) // All non-deleted alerts are considered active
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        openReports,
        inProgressReports,
        resolvedReports,
        totalEvents,
        totalAlerts,
        activeAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching authority dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch authority dashboard stats' });
  }
};

// Public stats for home page (no authentication required)
const getPublicStats = async (req, res) => {
  try {
    const [
      totalReports,
      resolvedReports,
      totalUsers,
      totalCities
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'RESOLVED' } }),
      prisma.user.count({ where: { isVerified: true } }), // Only verified users
      prisma.city.count()
    ]);

    // Calculate average response time (simplified)
    const avgResponseTime = 2.5; // This could be calculated from actual data

    res.json({
      success: true,
      stats: {
        totalReports,
        resolvedIssues: resolvedReports,
        activeUsers: totalUsers,
        avgResponseTime
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ 
      success: false, 
      stats: {
        totalReports: 0,
        resolvedIssues: 0,
        activeUsers: 0,
        avgResponseTime: 0
      }
    });
  }
};

module.exports = {
  getDashboardStats,
  getUserAnalytics,
  getReportAnalytics,
  getEventAnalytics,
  getAlertAnalytics,
  getAuthorityDashboardStats,
  getPublicStats
};
