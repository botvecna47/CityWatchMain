const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  updateUserCity,
  getCurrentUser,
  updateUserProfile,
} = require('../controllers/userController');
const {
  profileUpload,
  handleProfileUploadError,
} = require('../middleware/profileUpload');

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/me - Get current user profile
router.get('/me', getCurrentUser);

// PATCH /api/users/me - Update user profile (username, bio, city, profile picture)
router.patch(
  '/me',
  profileUpload.single('profilePicture'),
  handleProfileUploadError,
  updateUserProfile
);

// PATCH /api/users/me/city - Update user's city (legacy endpoint, kept for compatibility)
router.patch('/me/city', updateUserCity);

module.exports = router;
