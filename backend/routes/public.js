const express = require('express');
const router = express.Router();
const prisma = require('../services/database');

// Get public statistics
router.get('/stats', async (req, res) => {
  try {
    // Get basic stats that can be shown publicly
    const [
      totalReports,
      resolvedReports,
      totalUsers,
      avgResponseTime
    ] = await Promise.all([
      prisma.report.count({
        where: { deleted: false }
      }),
      prisma.report.count({
        where: { 
          deleted: false,
          status: { in: ['RESOLVED', 'CLOSED'] }
        }
      }),
      prisma.user.count({
        where: { isBanned: false }
      }),
      // Calculate average response time (simplified)
      prisma.report.aggregate({
        where: {
          deleted: false,
          status: { in: ['RESOLVED', 'CLOSED'] }
        },
        _avg: {
          // This would need to be calculated based on actual response times
          // For now, return a mock value
        }
      })
    ]);

    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalReports,
        resolvedIssues: resolutionRate,
        activeUsers: totalUsers,
        avgResponseTime: 2.4 // Mock value for now
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
