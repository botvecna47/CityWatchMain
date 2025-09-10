const prisma = require('../services/database');

// Add a comment to a report
const addComment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Comment content must be less than 1000 characters' });
    }

    // Check if report exists and user has access to it
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        deleted: false,
        // User must be in the same city as the report (unless admin)
        ...(req.user.role !== 'admin' && {
          cityId: req.user.cityId
        })
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        reportId,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for a report
const getComments = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Check if report exists and user has access to it
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        deleted: false,
        // User must be in the same city as the report (unless admin)
        ...(req.user.role !== 'admin' && {
          cityId: req.user.cityId
        })
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    // Get comments with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { reportId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.comment.count({ where: { reportId } })
    ]);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete a comment (admin only)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        report: true,
        author: true
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user has access to the report
    const hasAccess = req.user.role === 'admin' || 
      (comment.report.cityId === req.user.cityId && comment.authorId === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment
};
