const prisma = require('../services/database');

// Update user's city
const updateUserCity = async (req, res) => {
  try {
    const { cityId } = req.body;
    const userId = req.user.id;

    if (!cityId) {
      return res.status(400).json({
        error: 'cityId is required'
      });
    }

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    });

    if (!city) {
      return res.status(404).json({
        error: 'City not found'
      });
    }

    // Get current user city for audit
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Update user's city
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { cityId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        cityId: true,
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        actorRole: req.user.role,
        action: 'change_city',
        targetType: 'user',
        targetId: userId,
        reason: `Changed city from ${currentUser.city?.name || 'None'} to ${city.name}`,
        metadata: {
          previousCityId: currentUser.cityId,
          previousCityName: currentUser.city?.name || 'None',
          newCityId: cityId,
          newCityName: city.name,
          changedAt: new Date().toISOString()
        }
      }
    });

    res.json({
      message: 'City updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user city error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  updateUserCity
};
