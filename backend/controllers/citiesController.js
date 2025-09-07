const prisma = require('../services/database');

// Get all cities (public endpoint)
const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ cities });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Create a new city (admin only - for seeding)
const createCity = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: 'Name and slug are required'
      });
    }

    // Check if slug already exists
    const existingCity = await prisma.city.findUnique({
      where: { slug }
    });

    if (existingCity) {
      return res.status(409).json({
        error: 'City with this slug already exists'
      });
    }

    const city = await prisma.city.create({
      data: {
        name,
        slug
      }
    });

    res.status(201).json({
      message: 'City created successfully',
      city
    });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getCities,
  createCity
};
