const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/validate-signup', authController.validateSignupData);
router.post('/send-verification', authController.sendVerificationEmail);
router.post('/complete-signup', authController.completeSignup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
