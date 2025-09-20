const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const { postLimiter } = require('../middleware/rateLimiter');
const {
  createCityChangeRequest,
  getUserCityChangeRequests,
  getAllCityChangeRequests,
  updateCityChangeRequest
} = require('../controllers/cityChangeController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/city-change - Create city change request (Users and Authorities)
router.post('/', postLimiter, createCityChangeRequest);

// GET /api/city-change/my-requests - Get user's own city change requests
router.get('/my-requests', getUserCityChangeRequests);

// GET /api/city-change/all - Get all city change requests (Admin only)
router.get('/all', requireAdmin, getAllCityChangeRequests);

// PATCH /api/city-change/:id - Approve/reject city change request (Admin only)
router.patch('/:id', postLimiter, requireAdmin, updateCityChangeRequest);

module.exports = router;


