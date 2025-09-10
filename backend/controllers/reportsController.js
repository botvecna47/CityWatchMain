const prisma = require('../services/database');
const notificationService = require('../services/notifications');

// Create a new report (Citizens only)
const createReport = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const authorId = req.user.id;
    const cityId = req.user.cityId; // Server enforces cityId from user

    // Enforce citizen-only creation
    if (req.user.role !== 'citizen') {
      return res.status(403).json({
        error: 'Only citizens can create reports'
      });
    }

    // Ensure user has a city
    if (!req.user.cityId) {
      return res.status(400).json({
        error: 'You must be assigned to a city before creating reports. Please update your city in settings.'
      });
    }

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        error: 'All fields are required: title, description, category'
      });
    }

    // Validate title length
    if (title.trim().length < 5) {
      return res.status(400).json({
        error: 'Title must be at least 5 characters long'
      });
    }

    // Validate description length
    if (description.trim().length < 10) {
      return res.status(400).json({
        error: 'Description must be at least 10 characters long'
      });
    }

    // Validate category
    const validCategories = ['GARBAGE', 'ROAD', 'WATER', 'POWER', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category. Must be one of: ' + validCategories.join(', ')
      });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        cityId,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Report created successfully',
      report
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get reports list (filtered by user's city)
const getReports = async (req, res) => {
  try {
    const userCityId = req.user.cityId;
    const { category, status, page = 1, limit = 20, q } = req.query;

    // If user has no city, return empty results
    if (!userCityId) {
      return res.json({
        reports: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
        categoryStats: {}
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      cityId: userCityId,
      deleted: false
    };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Get reports with pagination
    const [reports, total, categoryCounts] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              comments: true,
              attachments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.report.count({ where }),
      prisma.report.groupBy({
        by: ['category'],
        where: {
          cityId: userCityId,
          deleted: false
        },
        _count: {
          category: true
        }
      })
    ]);

    // Format category counts
    const categoryStats = categoryCounts.reduce((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {});

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      categoryStats
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userCityId = req.user.cityId;
    const userRole = req.user.role;

    const report = await prisma.report.findFirst({
      where: {
        id,
        deleted: false,
        // City scoping: users can only see reports from their city unless admin
        ...(userRole !== 'admin' ? { cityId: userCityId } : {})
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        authorityUpdates: {
          include: {
            authority: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        attachments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Add full URLs to attachments
    if (report.attachments) {
      report.attachments = report.attachments.map(attachment => ({
        ...attachment,
        url: `http://localhost:5000/uploads/${attachment.filepath}`
      }));
    }

    // For admin users, also include timeline data
    if (userRole === 'admin') {
      // Get all timeline events
      const [authorityUpdates, comments, attachments] = await Promise.all([
        prisma.authorityUpdate.findMany({
          where: { reportId: id },
          include: {
            authority: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }),
        prisma.comment.findMany({
          where: { reportId: id },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }),
        prisma.attachment.findMany({
          where: { reportId: id },
          orderBy: { createdAt: 'asc' }
        })
      ]);

      // Create timeline events
      const timeline = [];

      // Add report creation event
      timeline.push({
        id: `report-${report.id}`,
        type: 'report_created',
        timestamp: report.createdAt,
        data: {
          title: report.title,
          description: report.description,
          category: report.category,
          status: report.status,
          author: report.author
        }
      });

      // Add authority updates
      authorityUpdates.forEach(update => {
        timeline.push({
          id: `update-${update.id}`,
          type: 'authority_update',
          timestamp: update.createdAt,
          data: {
            text: update.text,
            newStatus: update.newStatus,
            authority: update.authority
          }
        });
      });

      // Add comments
      comments.forEach(comment => {
        timeline.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          timestamp: comment.createdAt,
          data: {
            content: comment.content,
            author: comment.author
          }
        });
      });

      // Add file uploads
      attachments.forEach(attachment => {
        timeline.push({
          id: `attachment-${attachment.id}`,
          type: 'file_upload',
          timestamp: attachment.createdAt,
          data: {
            filename: attachment.filename,
            mimetype: attachment.mimetype,
            size: attachment.size
          }
        });
      });

      // Sort timeline by timestamp
      timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      res.json({ 
        report: {
          ...report,
          timeline
        }
      });
    } else {
      res.json({ report });
    }

  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Add authority update to report
const addAuthorityUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, newStatus } = req.body;
    const authorityId = req.user.id;
    const userRole = req.user.role;

    // Only authority or admin can add updates
    if (userRole !== 'authority' && userRole !== 'admin') {
      return res.status(403).json({
        error: 'Only authorities and admins can add updates'
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Update text is required'
      });
    }

    // Get current report
    const currentReport = await prisma.report.findFirst({
      where: {
        id,
        deleted: false,
        cityId: req.user.cityId // Authority must be from same city
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!currentReport) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Validate status transition if provided
    if (newStatus) {
      const currentStatus = currentReport.status;
      const validTransitions = {
        'OPEN': ['IN_PROGRESS'],
        'IN_PROGRESS': ['RESOLVED'],
        'RESOLVED': [], // Only author can close
        'CLOSED': []
      };

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return res.status(409).json({
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`
        });
      }
    }

    // Create authority update and update report status if needed
    const result = await prisma.$transaction(async (tx) => {
      // Create authority update
      const authorityUpdate = await tx.authorityUpdate.create({
        data: {
          reportId: id,
          authorityId,
          text: text.trim(),
          newStatus: newStatus || null
        },
        include: {
          authority: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      });

      // Update report status if newStatus provided
      let updatedReport = currentReport;
      if (newStatus) {
        updatedReport = await tx.report.update({
          where: { id },
          data: { status: newStatus },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true
              }
            },
            city: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        });
      }

      return { authorityUpdate, updatedReport };
    });

    // Send notifications
    if (newStatus === 'RESOLVED') {
      await notificationService.createNotification(
        currentReport.author.id,
        'report_resolved',
        `Your report "${currentReport.title}" has been resolved by ${req.user.username}`,
        id
      );
    } else if (newStatus) {
      await notificationService.createNotification(
        currentReport.author.id,
        'status_change',
        `Your report "${currentReport.title}" status changed to ${newStatus} by ${req.user.username}`,
        id
      );
    }
    
    // Always notify about authority update
    await notificationService.createNotification(
      currentReport.author.id,
      'authority_update',
      `${req.user.username} added an update to your report "${currentReport.title}"`,
      id
    );

    res.json({
      message: 'Authority update added successfully',
      authorityUpdate: result.authorityUpdate,
      report: result.updatedReport
    });

  } catch (error) {
    console.error('Add authority update error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Close report (author only)
const closeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get current report
    const currentReport = await prisma.report.findFirst({
      where: {
        id,
        deleted: false,
        authorId: userId // Only author can close
      }
    });

    if (!currentReport) {
      return res.status(404).json({
        error: 'Report not found or you are not the author'
      });
    }

    // Check if report is in RESOLVED status
    if (currentReport.status !== 'RESOLVED') {
      return res.status(409).json({
        error: 'Can only close reports that are in RESOLVED status'
      });
    }

    // Update report status to CLOSED
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Send notification to all commenters that the report was closed
    const commenters = await notificationService.getReportCommenters(id, userId);
    if (commenters.length > 0) {
      await notificationService.createNotificationsForUsers(
        commenters,
        'report_closed',
        `Report "${currentReport.title}" has been closed by the author`,
        id
      );
    }

    res.json({
      message: 'Report closed successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Close report error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Delete report (admin only)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        error: 'Deletion reason is required for audit purposes'
      });
    }

    // Get current report
    const currentReport = await prisma.report.findFirst({
      where: {
        id,
        deleted: false
      },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    });

    if (!currentReport) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Soft delete report and create audit log
    const result = await prisma.$transaction(async (tx) => {
      // Soft delete the report
      const deletedReport = await tx.report.update({
        where: { id },
        data: { deleted: true }
      });

      // Create audit log entry
      const auditLog = await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: req.user.role,
          action: 'admin_delete_report',
          targetType: 'report',
          targetId: id,
          reason: reason.trim(),
          metadata: {
            reportTitle: currentReport.title,
            originalAuthor: currentReport.author.username,
            deletedAt: new Date().toISOString()
          }
        }
      });

      return { deletedReport, auditLog };
    });

    res.json({
      message: 'Report deleted successfully',
      auditLog: result.auditLog
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get timeline for a report
const getReportTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const userCityId = req.user.cityId;
    const userRole = req.user.role;

    // Check if report exists and user has access
    const report = await prisma.report.findFirst({
      where: {
        id,
        deleted: false,
        // City scoping: users can only see reports from their city unless admin
        ...(userRole !== 'admin' ? { cityId: userCityId } : {})
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Get all timeline events
    const [authorityUpdates, comments, attachments] = await Promise.all([
      prisma.authorityUpdate.findMany({
        where: { reportId: id },
        include: {
          authority: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.comment.findMany({
        where: { reportId: id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.attachment.findMany({
        where: { reportId: id },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Create timeline events
    const timeline = [];

    // Add report creation event
    timeline.push({
      id: `report-${report.id}`,
      type: 'report_created',
      timestamp: report.createdAt,
      data: {
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        author: report.author
      }
    });

    // Add authority updates
    authorityUpdates.forEach(update => {
      timeline.push({
        id: `update-${update.id}`,
        type: 'authority_update',
        timestamp: update.createdAt,
        data: {
          text: update.text,
          newStatus: update.newStatus,
          authority: update.authority
        }
      });
    });

    // Add comments
    comments.forEach(comment => {
      timeline.push({
        id: `comment-${comment.id}`,
        type: 'comment',
        timestamp: comment.createdAt,
        data: {
          content: comment.content,
          author: comment.author
        }
      });
    });

    // Add file uploads
    attachments.forEach(attachment => {
      timeline.push({
        id: `attachment-${attachment.id}`,
        type: 'file_upload',
        timestamp: attachment.createdAt,
        data: {
          filename: attachment.filename,
          mimetype: attachment.mimetype,
          size: attachment.size
        }
      });
    });

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      report: {
        id: report.id,
        title: report.title,
        category: report.category,
        status: report.status,
        city: report.city
      },
      timeline
    });

  } catch (error) {
    console.error('Get report timeline error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  addAuthorityUpdate,
  closeReport,
  deleteReport,
  getReportTimeline
};