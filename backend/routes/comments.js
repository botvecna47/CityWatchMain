const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentsController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/comments/:reportId - Add a comment to a report
router.post('/:reportId', addComment);

// GET /api/comments/:reportId - Get comments for a report
router.get('/:reportId', getComments);

// DELETE /api/comments/:commentId - Delete a comment (admin only)
router.delete('/:commentId', requireAdmin, deleteComment);

module.exports = router;

