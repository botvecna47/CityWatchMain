const prisma = require('../services/database');
const fs = require('fs');
const path = require('path');
const { notifyEventCreated } = require('../services/notificationService');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, location } = req.body;
    const createdBy = req.user.id;
    const cityId = req.user.cityId;

    // Validation
    if (!title || !description || !dateTime) {
      return res.status(400).json({
        error: 'Title, description, and dateTime are required'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        error: 'Title must be at least 3 characters long'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        error: 'Description must be at least 10 characters long'
      });
    }

    // Validate date is in the future
    const eventDate = new Date(dateTime);
    const now = new Date();
    if (eventDate <= now) {
      return res.status(400).json({
        error: 'Event date must be in the future'
      });
    }

    // Ensure user has a city
    if (!cityId) {
      return res.status(400).json({
        error: 'You must be assigned to a city before creating events'
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/assets/events/${req.file.filename}`;
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        dateTime: eventDate,
        location: location?.trim() || null,
        imageUrl,
        cityId,
        createdBy
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

    // Notify all users in the city about the new event
    try {
      await notifyEventCreated(
        cityId,
        event.id,
        event.title,
        event.creator.username
      );
    } catch (notificationError) {
      console.error('Error notifying users of new event:', notificationError);
      // Don't fail the event creation if notification fails
    }

    // Generate image URL if present
    if (event.imageUrl) {
      event.imageUrl = `http://localhost:5000${event.imageUrl}`;
    }

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      error: 'Failed to create event'
    });
  }
};

// Get events for a city
const getEvents = async (req, res) => {
  try {
    const { cityId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    // If cityId is provided, filter by city
    if (cityId) {
      where.cityId = cityId;
    } else if (req.user && req.user.cityId) {
      // If user is logged in and has a city, show their city's events
      where.cityId = req.user.cityId;
    } else {
      // If no city specified and user has no city, return empty results
      return res.json({
        events: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
      });
    }

    // Get events with pagination - newest first
    const [events, total] = await Promise.all([
      prisma.event.findMany({
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
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.event.count({ where })
    ]);

    // Generate image URLs
    const eventsWithUrls = events.map((event) => ({
      ...event,
      imageUrl: event.imageUrl
        ? `http://localhost:5000${event.imageUrl}`
        : null
    }));

    res.json({
      events: eventsWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Failed to fetch events'
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
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

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    // Generate image URL if present
    if (event.imageUrl) {
      event.imageUrl = `http://localhost:5000${event.imageUrl}`;
    }

    res.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      error: 'Failed to fetch event'
    });
  }
};

// Delete event (only creator or admin)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          },
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    // Check permissions (creator or admin)
    if (event.createdBy !== userId && userRole !== 'admin') {
      return res.status(403).json({
        error: 'You can only delete your own events'
      });
    }

    // Delete the event image if it exists
    if (event.imageUrl) {
      const imagePath = path.join(
        __dirname,
        '..',
        'assets',
        'events',
        path.basename(event.imageUrl)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the event
    await prisma.event.delete({
      where: { id }
    });

    res.json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      error: 'Failed to delete event'
    });
  }
};

// Get my events (events created by the current user)
const getMyEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const userId = req.user.id;

    // Get user's events with pagination
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { createdBy: userId },
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
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.event.count({ where: { createdBy: userId } })
    ]);

    // Generate image URLs
    const eventsWithUrls = events.map((event) => ({
      ...event,
      imageUrl: event.imageUrl
        ? `http://localhost:5000${event.imageUrl}`
        : null
    }));

    res.json({
      events: eventsWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
    });
  } catch (error) {
    console.error('Error fetching my events:', error);
    res.status(500).json({
      error: 'Failed to fetch your events'
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  deleteEvent,
  getMyEvents
};
