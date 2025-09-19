const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
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

module.exports = router;
