const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const {
  eventUpload,
  handleEventUploadError,
} = require('../middleware/eventUpload');
const {
  createEvent,
  getEvents,
  getEventById,
  deleteEvent,
  getMyEvents,
  approveEvent,
  rejectEvent,
  getPendingEvents,
} = require('../controllers/eventsController');

// Public routes (no auth required)
router.get('/:id', getEventById); // Get single event

// Protected routes (auth required)
router.get('/', authMiddleware, getEvents); // Get events for a city
router.post(
  '/',
  authMiddleware,
  eventUpload.single('image'),
  handleEventUploadError,
  createEvent
); // Create event
router.delete('/:id', authMiddleware, deleteEvent); // Delete event
router.get('/my/events', authMiddleware, getMyEvents); // Get my events

// Admin routes for event approval
router.get('/admin/pending', authMiddleware, requireAdmin, getPendingEvents); // Get pending events
router.patch('/:id/approve', authMiddleware, requireAdmin, approveEvent); // Approve event
router.patch('/:id/reject', authMiddleware, requireAdmin, rejectEvent); // Reject event

module.exports = router;
