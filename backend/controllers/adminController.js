const prisma = require('../services/database');

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      city = '',
      banned = ''
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (city) {
      where.cityId = city;
    }

    if (banned !== '') {
      where.isBanned = banned === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          cityId: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
          city: {
            select: {
              id: true,
              name: true,
              slug: true
            },
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    // Validate role
    if (!['citizen', 'authority', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          },
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: id,
        actorRole: role,
        action: `User role changed from ${currentUser.role} to ${role}`,
        actionType: role === 'authority' ? 'USER_PROMOTE' : 'USER_DEMOTE',
        targetType: 'USER',
        targetId: id,
        performedById: adminId,
        reason: `Role changed by admin ${req.user.username}`
      },
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Toggle user ban status
const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, isBanned: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle ban status
    const newBanStatus = !currentUser.isBanned;
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned: newBanStatus },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          },
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: id,
        actorRole: updatedUser.role,
        action: `User ${newBanStatus ? 'banned' : 'unbanned'}`,
        actionType: 'USER_BAN',
        targetType: 'USER',
        targetId: id,
        performedById: adminId,
        reason: `User ${newBanStatus ? 'banned' : 'unbanned'} by admin ${req.user.username}`
      },
    });

    res.json({
      message: `User ${newBanStatus ? 'banned' : 'unbanned'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({ error: 'Failed to toggle user ban status' });
  }
};

// Create new admin user
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, cityId } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'User with this username or email already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'admin',
        cityId: cityId || null,
        isBanned: false
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          },
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: newAdmin.id,
        actorRole: 'admin',
        action: 'New admin user created',
        actionType: 'USER_PROMOTE',
        targetType: 'USER',
        targetId: newAdmin.id,
        performedById: adminId,
        reason: `Admin user created by ${req.user.username}`
      },
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        city: newAdmin.city,
        isBanned: newAdmin.isBanned,
        createdAt: newAdmin.createdAt
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

// Get all reports with filters
const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      category = '',
      city = '',
      deleted = ''
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (city) {
      where.cityId = city;
    }

    if (deleted !== '') {
      where.deleted = deleted === 'true';
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          status: true,
          deleted: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              role: true
            },
          },
          city: {
            select: {
              id: true,
              name: true,
              slug: true
            },
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Soft delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Get current report
    const currentReport = await prisma.report.findUnique({
      where: { id },
      select: { id: true, title: true, deleted: true }
    });

    if (!currentReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Soft delete report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { deleted: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          },
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'admin',
        action: 'Report soft deleted',
        actionType: 'REPORT_DELETE',
        targetType: 'REPORT',
        targetId: id,
        performedById: adminId,
        reason: `Report "${currentReport.title}" deleted by admin ${req.user.username}`
      },
    });

    res.json({
      message: 'Report deleted successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

// Restore report
const restoreReport = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Get current report
    const currentReport = await prisma.report.findUnique({
      where: { id },
      select: { id: true, title: true, deleted: true }
    });

    if (!currentReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Restore report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { deleted: false },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          },
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'admin',
        action: 'Report restored',
        actionType: 'REPORT_RESTORE',
        targetType: 'REPORT',
        targetId: id,
        performedById: adminId,
        reason: `Report "${currentReport.title}" restored by admin ${req.user.username}`
      },
    });

    res.json({
      message: 'Report restored successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Restore report error:', error);
    res.status(500).json({ error: 'Failed to restore report' });
  }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, actionType = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (actionType) {
      where.actionType = actionType;
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              role: true
            },
          },
          performedBy: {
            select: {
              id: true,
              username: true,
              role: true
            },
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalReports,
      openReports,
      inProgressReports,
      resolvedReports,
      totalAuthorities,
      bannedUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count({ where: { deleted: false } }),
      prisma.report.count({ where: { status: 'OPEN', deleted: false } }),
      prisma.report.count({ where: { status: 'IN_PROGRESS', deleted: false } }),
      prisma.report.count({ where: { status: 'RESOLVED', deleted: false } }),
      prisma.user.count({ where: { role: 'authority' } }),
      prisma.user.count({ where: { isBanned: true } })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalReports,
        openReports,
        inProgressReports,
        resolvedReports,
        totalAuthorities,
        bannedUsers
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserBan,
  createAdmin,
  getReports,
  deleteReport,
  restoreReport,
  getAuditLogs,
  getDashboardStats
};
