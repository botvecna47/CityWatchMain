const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { updateUserCity } = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// PATCH /api/users/me/city - Update user's city
router.patch('/me/city', updateUserCity);

module.exports = router;
