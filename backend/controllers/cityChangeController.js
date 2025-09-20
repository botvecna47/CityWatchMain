const prisma = require('../services/database');

// Create a city change request
const createCityChangeRequest = async (req, res) => {
  try {
    const { requestedCityId, reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validation
    if (!requestedCityId) {
      return res.status(400).json({
        success: false,
        error: 'Requested city ID is required'
      });
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.cityChangeRequest.findFirst({
      where: {
        userId: userId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending city change request'
      });
    }

    // Verify requested city exists
    const requestedCity = await prisma.city.findUnique({
      where: { id: requestedCityId }
    });

    if (!requestedCity) {
      return res.status(404).json({
        success: false,
        error: 'Requested city not found'
      });
    }

    // Get current user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        city: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't allow requesting the same city
    if (user.cityId === requestedCityId) {
      return res.status(400).json({
        success: false,
        error: 'You are already assigned to this city'
      });
    }

    // Create the city change request
    const cityChangeRequest = await prisma.cityChangeRequest.create({
      data: {
        userId: userId,
        currentCityId: user.cityId,
        requestedCityId: requestedCityId,
        reason: reason || null,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        currentCity: {
          select: {
            id: true,
            name: true
          }
        },
        requestedCity: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        actorRole: userRole,
        action: 'request_city_change',
        actionType: 'USER_ACTION',
        targetType: 'city_change_request',
        targetId: cityChangeRequest.id,
        performedById: userId,
        reason: `Requested city change from ${user.city?.name || 'None'} to ${requestedCity.name}`,
        metadata: {
          currentCityId: user.cityId,
          currentCityName: user.city?.name || 'None',
          requestedCityId: requestedCityId,
          requestedCityName: requestedCity.name,
          reason: reason || null
        }
      }
    });

    res.json({
      success: true,
      message: 'City change request submitted successfully',
      data: cityChangeRequest
    });

  } catch (error) {
    console.error('Error creating city change request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create city change request'
    });
  }
};

// Get user's city change requests
const getUserCityChangeRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await prisma.cityChangeRequest.findMany({
      where: {
        userId: userId
      },
      include: {
        currentCity: {
          select: {
            id: true,
            name: true
          }
        },
        requestedCity: {
          select: {
            id: true,
            name: true
          }
        },
        admin: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching user city change requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city change requests'
    });
  }
};

// Get all city change requests (Admin only)
const getAllCityChangeRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause.status = status;
    }

    const [requests, totalCount] = await Promise.all([
      prisma.cityChangeRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          currentCity: {
            select: {
              id: true,
              name: true
            }
          },
          requestedCity: {
            select: {
              id: true,
              name: true
            }
          },
          admin: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.cityChangeRequest.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all city change requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city change requests'
    });
  }
};

// Approve or reject city change request (Admin only)
const updateCityChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "approved" or "rejected"'
      });
    }

    // Get the city change request
    const cityChangeRequest = await prisma.cityChangeRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            city: true
          }
        },
        currentCity: true,
        requestedCity: true
      }
    });

    if (!cityChangeRequest) {
      return res.status(404).json({
        success: false,
        error: 'City change request not found'
      });
    }

    if (cityChangeRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'This request has already been processed'
      });
    }

    // Update the request and user's city if approved
    const result = await prisma.$transaction(async (tx) => {
      // Update the city change request
      const updatedRequest = await tx.cityChangeRequest.update({
        where: { id },
        data: {
          status: status,
          adminId: adminId,
          adminNotes: adminNotes || null
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          currentCity: {
            select: {
              id: true,
              name: true
            }
          },
          requestedCity: {
            select: {
              id: true,
              name: true
            }
          },
          admin: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // If approved, update user's city
      if (status === 'approved') {
        await tx.user.update({
          where: { id: cityChangeRequest.userId },
          data: {
            cityId: cityChangeRequest.requestedCityId
          }
        });
      }

      return updatedRequest;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'admin',
        action: `${status}_city_change_request`,
        actionType: 'ADMIN_ACTION',
        targetType: 'city_change_request',
        targetId: id,
        performedById: adminId,
        reason: `${status.charAt(0).toUpperCase() + status.slice(1)} city change request for user ${cityChangeRequest.user.username}`,
        metadata: {
          userId: cityChangeRequest.userId,
          username: cityChangeRequest.user.username,
          currentCityId: cityChangeRequest.currentCityId,
          currentCityName: cityChangeRequest.currentCity?.name || 'None',
          requestedCityId: cityChangeRequest.requestedCityId,
          requestedCityName: cityChangeRequest.requestedCity.name,
          adminNotes: adminNotes || null,
          previousStatus: 'pending',
          newStatus: status
        }
      }
    });

    res.json({
      success: true,
      message: `City change request ${status} successfully`,
      data: result
    });

  } catch (error) {
    console.error('Error updating city change request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update city change request'
    });
  }
};

module.exports = {
  createCityChangeRequest,
  getUserCityChangeRequests,
  getAllCityChangeRequests,
  updateCityChangeRequest
};


