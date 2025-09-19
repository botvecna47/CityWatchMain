const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAuthority } = require('../middleware/roleAuth');
const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getMyAlerts,
} = require('../controllers/alertsController');

// Public routes (no auth required)
router.get('/:id', getAlertById); // Get single alert

// Protected routes (auth required)
router.get('/', authMiddleware, getAlerts); // Get alerts for a city

// Authority/Admin only routes (with auth middleware)
router.post('/', authMiddleware, requireAuthority, createAlert); // Create alert
router.patch('/:id', authMiddleware, requireAuthority, updateAlert); // Update alert
router.delete('/:id', authMiddleware, requireAuthority, deleteAlert); // Delete alert
router.get('/my/alerts', authMiddleware, requireAuthority, getMyAlerts); // Get my alerts

module.exports = router;
