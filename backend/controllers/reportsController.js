const prisma = require('../services/database');
const cacheService = require('../services/cacheService');
const {
  notifyAuthoritiesOfNewReport,
  notifyAuthorityUpdate,
  notifyReportClosed,
} = require('../services/notificationService');

// Create a new report (Citizens only)
const createReport = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;
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

    // Location is required
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location is required. Please provide latitude and longitude coordinates.'
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

    // Parse and validate location coordinates
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    
    // Validate coordinates
    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude values'
      });
    }
    
    if (parsedLatitude < -90 || parsedLatitude > 90) {
      return res.status(400).json({
        error: 'Latitude must be between -90 and 90 degrees'
      });
    }
    
    if (parsedLongitude < -180 || parsedLongitude > 180) {
      return res.status(400).json({
        error: 'Longitude must be between -180 and 180 degrees'
      });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        cityId,
        authorId,
        latitude: parsedLatitude,
        longitude: parsedLongitude
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    // Notify authorities in the city about the new report
    try {
      await notifyAuthoritiesOfNewReport(cityId, report.id, report.title, report.author.username);
    } catch (notificationError) {
      console.error('Error notifying authorities of new report:', notificationError);
      // Don't fail the report creation if notification fails
    }

    // Invalidate cache for this city
    cacheService.clear();

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
  const startTime = Date.now();
  console.time('getReports');
  
  try {
    const userCityId = req.user.cityId;
    const { category, status, page = 1, limit = 20, q } = req.query;
    
    // Enforce pagination limits
    const maxLimit = 100;
    const minLimit = 1;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, minLimit), maxLimit);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    // Check cache for GET requests (no search query)
    if (!q) {
      const cacheKey = cacheService.generateKey('reports', {
        userCityId,
        category,
        status,
        page: parsedPage,
        limit: parsedLimit
      });
      
      const cachedResult = cacheService.get(cacheKey);
      if (cachedResult) {
        const duration = Date.now() - startTime;
        console.timeEnd('getReports');
        console.log(`getReports served from cache in ${duration}ms - page:${parsedPage}, limit:${parsedLimit}`);
        return res.json(cachedResult);
      }
    }

    // If user has no city, return empty results
    if (!userCityId) {
      return res.json({
        reports: [],
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total: 0,
          pages: 0
        },
        categoryStats: {}
      });
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const take = parsedLimit;

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

    // Get reports with pagination - optimized query
    const [reports, total, categoryCounts] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              profilePicture: true
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

    const result = {
      reports,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit)
      },
      categoryStats
    };

    // Cache the result for GET requests (no search query)
    if (!q) {
      const cacheKey = cacheService.generateKey('reports', {
        userCityId,
        category,
        status,
        page: parsedPage,
        limit: parsedLimit
      });
      cacheService.set(cacheKey, result, 30 * 1000); // 30 seconds TTL
    }

    const duration = Date.now() - startTime;
    console.timeEnd('getReports');
    console.log(`getReports completed in ${duration}ms - page:${parsedPage}, limit:${parsedLimit}, total:${total}`);

    res.json(result);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.timeEnd('getReports');
    console.error(`Get reports error after ${duration}ms:`, error);
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
            role: true,
            profilePicture: true
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

    // Process authority updates to include resolution image URLs
    if (report.authorityUpdates) {
      report.authorityUpdates = report.authorityUpdates.map(update => {
        let resolutionImageUrls = [];
        if (update.resolutionImages) {
          try {
            const imageFilenames = JSON.parse(update.resolutionImages);
            resolutionImageUrls = imageFilenames.map(filename => `/assets/reports/${filename}`);
          } catch (error) {
            console.error('Error parsing resolution images JSON:', error);
          }
        }
        
        return {
          ...update,
          resolutionImageUrls
        };
      });
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
        // Parse resolution images if they exist
        let resolutionImages = [];
        if (update.resolutionImages) {
          try {
            resolutionImages = JSON.parse(update.resolutionImages);
          } catch (error) {
            console.error('Error parsing resolution images JSON:', error);
          }
        }
        
        timeline.push({
          id: `update-${update.id}`,
          type: 'authority_update',
          timestamp: update.createdAt,
          data: {
            text: update.text,
            newStatus: update.newStatus,
            authority: update.authority,
            resolutionImages: resolutionImages.map(filename => `/assets/reports/${filename}`)
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
    
    // Handle uploaded resolution images
    const resolutionImages = [];
    if (req.files && req.files.length > 0) {
      resolutionImages.push(...req.files.map(file => file.filename));
    }
    
    // Convert to JSON string for SQLite storage
    const resolutionImagesJson = resolutionImages.length > 0 ? JSON.stringify(resolutionImages) : null;

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
            username: true,
            profilePicture: true
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
          newStatus: newStatus || null,
          resolutionImages: resolutionImagesJson
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

    // Notify report author about authority update
    try {
      await notifyAuthorityUpdate(id, req.user.username, currentReport.title, authorityId);
    } catch (notificationError) {
      console.error('Error notifying authority update:', notificationError);
      // Don't fail the update if notification fails
    }

    // Parse resolution images JSON and add full URLs
    let resolutionImageUrls = [];
    if (result.authorityUpdate.resolutionImages) {
      try {
        const imageFilenames = JSON.parse(result.authorityUpdate.resolutionImages);
        resolutionImageUrls = imageFilenames.map(filename => `/assets/reports/${filename}`);
      } catch (error) {
        console.error('Error parsing resolution images JSON:', error);
      }
    }
    
    const authorityUpdateWithImages = {
      ...result.authorityUpdate,
      resolutionImageUrls
    };

    res.status(201).json({
      message: 'Authority update added successfully',
      authorityUpdate: authorityUpdateWithImages,
      report: result.updatedReport
    });

  } catch (error) {
    console.error('Add authority update error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Close a report (Author only)
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
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    if (!currentReport) {
      return res.status(404).json({
        error: 'Report not found or you are not authorized to close it'
      });
    }

    // Only RESOLVED reports can be closed
    if (currentReport.status !== 'RESOLVED') {
      return res.status(409).json({
        error: 'Only resolved reports can be closed'
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
            role: true,
            profilePicture: true
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

    // Notify report author that their report was closed
    try {
      await notifyReportClosed(id, currentReport.title, userId);
    } catch (notificationError) {
      console.error('Error notifying report closed:', notificationError);
      // Don't fail the close if notification fails
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

// Delete a report (Admin only)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        error: 'Reason for deletion is required'
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
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    if (!currentReport) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Soft delete the report
    const deletedReport = await prisma.report.update({
      where: { id },
      data: { deleted: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'admin',
        action: 'admin_delete_report',
        actionType: 'REPORT_DELETE',
        targetType: 'report',
        targetId: id,
        performedById: adminId,
        reason: reason.trim()
      }
    });

    res.json({
      message: 'Report deleted successfully',
      report: deletedReport
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get report timeline
const getReportTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get report with basic info
    const report = await prisma.report.findFirst({
      where: {
        id,
        deleted: false,
        // City scoping: users can only see reports from their city (unless admin)
        ...(userRole !== 'admin' && { cityId: req.user.cityId })
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            profilePicture: true
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
    const [authorityUpdates, comments] = await Promise.all([
      prisma.authorityUpdate.findMany({
        where: { reportId: id },
        include: {
          authority: {
            select: {
              id: true,
              username: true,
              role: true,
              profilePicture: true
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
              role: true,
              profilePicture: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Combine and sort timeline events
    const timeline = [
      {
        type: 'report_created',
        timestamp: report.createdAt,
        data: {
          report: {
            id: report.id,
            title: report.title,
            description: report.description,
            category: report.category,
            status: report.status
          },
          author: report.author
        }
      },
      ...authorityUpdates.map(update => {
        // Parse resolution images if they exist
        let resolutionImages = [];
        if (update.resolutionImages) {
          try {
            resolutionImages = JSON.parse(update.resolutionImages);
          } catch (error) {
            console.error('Error parsing resolution images JSON:', error);
          }
        }
        
        return {
          type: 'authority_update',
          timestamp: update.createdAt,
          data: {
            update: {
              id: update.id,
              text: update.text,
              newStatus: update.newStatus
            },
            authority: update.authority,
            resolutionImages: resolutionImages.map(filename => `/assets/reports/${filename}`)
          }
        };
      }),
      ...comments.map(comment => ({
        type: 'comment',
        timestamp: comment.createdAt,
        data: {
          comment: {
            id: comment.id,
            content: comment.content
          },
          author: comment.author
        }
      }))
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: {
        report,
        timeline
      }
    });

  } catch (error) {
    console.error('Get report timeline error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get reports near a specific location
const getNearbyReports = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in kilometers
    const userCityId = req.user.cityId;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({
        error: 'Invalid latitude, longitude, or radius values'
      });
    }

    // Calculate bounding box for approximate filtering (more efficient than distance calculation)
    const earthRadius = 6371; // Earth's radius in kilometers
    const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
    const lngDelta = (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLng = longitude - lngDelta;
    const maxLng = longitude + lngDelta;

    // Get reports in bounding box, then filter by actual distance
    const reports = await prisma.report.findMany({
      where: {
        cityId: userCityId,
        deleted: false,
        latitude: {
          gte: minLat,
          lte: maxLat
        },
        longitude: {
          gte: minLng,
          lte: maxLng
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            filepath: true,
            mimetype: true
          }
        },
        comments: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by actual distance using Haversine formula
    const nearbyReports = reports.filter(report => {
      if (!report.latitude || !report.longitude) return false;
      
      const distance = calculateDistance(
        latitude, longitude,
        report.latitude, report.longitude
      );
      
      return distance <= radiusKm;
    });

    // Add distance to each report
    const reportsWithDistance = nearbyReports.map(report => ({
      ...report,
      distance: calculateDistance(
        latitude, longitude,
        report.latitude, report.longitude
      )
    }));

    res.json({
      reports: reportsWithDistance,
      center: { lat: latitude, lng: longitude },
      radius: radiusKm,
      count: reportsWithDistance.length
    });

  } catch (error) {
    console.error('Error fetching nearby reports:', error);
    res.status(500).json({
      error: 'Failed to fetch nearby reports'
    });
  }
};

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  addAuthorityUpdate,
  closeReport,
  deleteReport,
  getReportTimeline,
  getNearbyReports
};