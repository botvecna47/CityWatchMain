const prisma = require('../services/database');
const { notifyCommentAdded } = require('../services/notificationService');

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
            role: true,
            profilePicture: true
          }
        },
        report: {
          select: {
            id: true,
            title: true,
            authorId: true
          }
        }
      }
    });

    // Notify report author and other commenters about the new comment
    try {
      await notifyCommentAdded(reportId, comment.author.username, comment.report.title, userId);
    } catch (notificationError) {
      console.error('Error notifying comment added:', notificationError);
      // Don't fail the comment creation if notification fails
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for a report
const getComments = async (req, res) => {
  const startTime = Date.now();
  console.time('getComments');
  
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
    const maxLimit = 100;
    const minLimit = 1;
    const parsedLimit = Math.min(Math.max(parseInt(req.query.limit) || 20, minLimit), maxLimit);
    const parsedPage = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { reportId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              profilePicture: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: parsedLimit
      }),
      prisma.comment.count({ where: { reportId } })
    ]);

    const duration = Date.now() - startTime;
    console.timeEnd('getComments');
    console.log(`getComments completed in ${duration}ms - reportId:${reportId}, page:${parsedPage}, limit:${parsedLimit}, total:${total}`);

    res.json({
      comments,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.timeEnd('getComments');
    console.error(`Get comments error after ${duration}ms:`, error);
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
