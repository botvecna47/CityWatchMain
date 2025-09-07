const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const { getCities, createCity } = require('../controllers/citiesController');

// GET /api/cities - Public endpoint to get all cities
router.get('/', getCities);

// POST /api/cities - Create city (admin only)
router.post('/', authMiddleware, requireAdmin, createCity);

module.exports = router;
