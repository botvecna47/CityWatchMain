const prisma = require('../services/database');
const { createAlertNotification } = require('../services/notificationService');

// Create a new alert (Authority/Admin only)
const createAlert = async (req, res) => {
  try {
    const { title, message, isPinned = false } = req.body;
    const createdBy = req.user.id;
    const cityId = req.user.cityId;

    // Only authority or admin can create alerts
    if (!['authority', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Only authorities and admins can create alerts'
      });
    }

    // Determine the cityId to use
    let alertCityId = cityId;

    // If user is admin, they can specify cityId in request body
    if (req.user.role === 'admin' && req.body.cityId) {
      alertCityId = req.body.cityId;
    }

    // Ensure we have a valid cityId
    if (!alertCityId) {
      return res.status(400).json({
        error:
          req.user.role === 'admin'
            ? 'Please specify a cityId in the request body'
            : 'You must be assigned to a city before creating alerts'
      });
    }

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        error: 'Title and message are required'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        error: 'Title must be at least 3 characters long'
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        error: 'Message must be at least 10 characters long'
      });
    }

    // Create alert
    const alert = await prisma.alert.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        cityId: alertCityId,
        createdBy,
        isPinned: Boolean(isPinned)
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    // Notify all users in the city about the new alert
    try {
      await createAlertNotification(alert.id, alertCityId);
    } catch (notificationError) {
      console.error('Error notifying users of new alert:', notificationError);
      // Don't fail the alert creation if notification fails
    }

    res.status(201).json({
      message: 'Alert created successfully',
      alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get alerts for a city (Public)
const getAlerts = async (req, res) => {
  try {
    const { cityId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      deleted: false
    };

    // If cityId is provided, filter by city
    if (cityId) {
      where.cityId = cityId;
    } else if (req.user && req.user.cityId) {
      // If user is logged in and has a city, show their city's alerts
      where.cityId = req.user.cityId;
    } else {
      // If no city specified and user has no city, return empty results
      return res.json({
        alerts: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
      });
    }

    // Get alerts with pagination - pinned first, then by date
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
              profilePicture: true
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
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      prisma.alert.count({ where })
    ]);

    res.json({
      alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get single alert by ID
const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findFirst({
      where: {
        id,
        deleted: false
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    res.json({ alert });
  } catch (error) {
    console.error('Get alert by ID error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update an alert (Authority/Admin only)
const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, isPinned } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only authority or admin can update alerts
    if (!['authority', 'admin'].includes(userRole)) {
      return res.status(403).json({
        error: 'Only authorities and admins can update alerts'
      });
    }

    // Get current alert
    const currentAlert = await prisma.alert.findFirst({
      where: {
        id,
        deleted: false
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          },
        }
      }
    });

    if (!currentAlert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    // Check permissions: creator or admin can edit
    if (userRole !== 'admin' && currentAlert.createdBy !== userId) {
      return res.status(403).json({
        error: 'You can only edit your own alerts'
      });
    }

    // Check if authority is from same city (unless admin)
    if (userRole !== 'admin' && currentAlert.cityId !== req.user.cityId) {
      return res.status(403).json({
        error: 'You can only edit alerts from your city'
      });
    }

    // Validation
    if (title && title.trim().length < 3) {
      return res.status(400).json({
        error: 'Title must be at least 3 characters long'
      });
    }

    if (message && message.trim().length < 10) {
      return res.status(400).json({
        error: 'Message must be at least 10 characters long'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (message !== undefined) {
      updateData.message = message.trim();
    }
    if (isPinned !== undefined) {
      updateData.isPinned = Boolean(isPinned);
    }

    // Update alert
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    res.json({
      message: 'Alert updated successfully',
      alert: updatedAlert
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Delete an alert (Authority/Admin only)
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only authority or admin can delete alerts
    if (!['authority', 'admin'].includes(userRole)) {
      return res.status(403).json({
        error: 'Only authorities and admins can delete alerts'
      });
    }

    // Get current alert
    const currentAlert = await prisma.alert.findFirst({
      where: {
        id,
        deleted: false
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          },
        }
      }
    });

    if (!currentAlert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    // Check permissions: creator or admin can delete
    if (userRole !== 'admin' && currentAlert.createdBy !== userId) {
      return res.status(403).json({
        error: 'You can only delete your own alerts'
      });
    }

    // Check if authority is from same city (unless admin)
    if (userRole !== 'admin' && currentAlert.cityId !== req.user.cityId) {
      return res.status(403).json({
        error: 'You can only delete alerts from your city'
      });
    }

    // Soft delete the alert
    const deletedAlert = await prisma.alert.update({
      where: { id },
      data: { deleted: true },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    res.json({
      message: 'Alert deleted successfully',
      alert: deletedAlert
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get alerts created by current user (for authority dashboard)
const getMyAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Only authority or admin can access this endpoint
    if (!['authority', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Only authorities and admins can access this endpoint'
      });
    }

    const where = {
      createdBy: userId,
      deleted: false
    };

    // If not admin, only show alerts from user's city
    if (req.user.role !== 'admin' && req.user.cityId) {
      where.cityId = req.user.cityId;
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
              profilePicture: true
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
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      prisma.alert.count({ where })
    ]);

    res.json({
      alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Get my alerts error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getMyAlerts
};
