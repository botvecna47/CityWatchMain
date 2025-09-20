const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
// const { requireAdmin } = require('../middleware/roleAuth'); // Not used in this file
const { heavyGetLimiter, postLimiter } = require('../middleware/rateLimiter');
const {
  upload,
  saveValidatedFiles,
  handleUploadError,
} = require('../middleware/upload');
const {
  createReport,
  getReports,
  getReportById,
  addAuthorityUpdate,
  closeReport,
  deleteReport,
  getReportTimeline,
  getNearbyReports,
  checkDuplicateReport,
  verifyReport,
  getReportVerification,
  voteOnReport,
  getUserVote,
} = require('../controllers/reportsController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/reports - Create new report (Citizens only - enforced in controller)
router.post('/', postLimiter, createReport);

// POST /api/reports/check-duplicate - Check for duplicate reports
router.post('/check-duplicate', postLimiter, checkDuplicateReport);

// GET /api/reports - Get reports list (filtered by user's city)
router.get('/', heavyGetLimiter, getReports);

// GET /api/reports/nearby - Get reports near a location
router.get('/nearby', heavyGetLimiter, getNearbyReports);

// GET /api/reports/:id - Get single report
router.get('/:id', heavyGetLimiter, getReportById);

// GET /api/reports/:id/timeline - Get report timeline
router.get('/:id/timeline', heavyGetLimiter, getReportTimeline);

// POST /api/reports/:id/updates - Add authority update (Authority/Admin only - enforced in controller)
router.post(
  '/:id/updates',
  postLimiter,
  upload.array('resolutionImages', 5),
  saveValidatedFiles,
  handleUploadError,
  addAuthorityUpdate
);

// PATCH /api/reports/:id/close - Close report (Author only - enforced in controller)
router.patch('/:id/close', postLimiter, closeReport);

// DELETE /api/reports/:id - Delete report (Admin only - enforced in controller)
router.delete('/:id', postLimiter, deleteReport);

// POST /api/reports/:id/verify - Verify report resolution (Citizens only)
router.post('/:id/verify', postLimiter, verifyReport);

// GET /api/reports/:id/verification - Get report verification status
router.get('/:id/verification', getReportVerification);

// POST /api/reports/:id/vote - Vote on report severity (Citizens only)
router.post('/:id/vote', postLimiter, voteOnReport);

// GET /api/reports/:id/vote - Get user's vote on report
router.get('/:id/vote', getUserVote);

module.exports = router;
