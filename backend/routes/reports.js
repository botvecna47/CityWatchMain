const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const {
  createReport,
  getReports,
  getReportById,
  addAuthorityUpdate,
  closeReport,
  deleteReport
} = require('../controllers/reportsController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/reports - Create new report (Citizens only - enforced in controller)
router.post('/', createReport);

// GET /api/reports - Get reports list (filtered by user's city)
router.get('/', getReports);

// GET /api/reports/:id - Get single report
router.get('/:id', getReportById);

// POST /api/reports/:id/updates - Add authority update (Authority/Admin only - enforced in controller)
router.post('/:id/updates', addAuthorityUpdate);

// PATCH /api/reports/:id/close - Close report (Author only - enforced in controller)
router.patch('/:id/close', closeReport);

// DELETE /api/reports/:id - Delete report (Admin only - enforced in controller)
router.delete('/:id', deleteReport);

module.exports = router;
