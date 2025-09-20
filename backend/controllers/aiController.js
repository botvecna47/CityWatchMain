const aiService = require('../services/aiService');
const { createErrorResponse, createSuccessResponse } = require('../middleware/errorHandler');
const prisma = require('../services/database');

// Chat with AI assistant
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json(
        createErrorResponse('Message is required', 'VALIDATION_ERROR', 400)
      );
    }

    // Process message length limit
    if (message.length > 500) {
      return res.status(400).json(
        createErrorResponse('Message is too long. Please keep it under 500 characters.', 'VALIDATION_ERROR', 400)
      );
    }

    console.log(`🤖 AI Chat - User: ${user.username}, Message: "${message}"`);

    // Get AI response
    const aiResponse = await aiService.processMessage(message, user);

    // Get smart suggestions
    const suggestions = await aiService.getSmartSuggestions(user.cityId);

    res.json(createSuccessResponse({
      message: aiResponse,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    }, 'AI response generated successfully'));

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json(
      createErrorResponse('Failed to process your message. Please try again.', 'INTERNAL_ERROR', 500)
    );
  }
};

// Get city updates specifically
const getCityUpdates = async (req, res) => {
  try {
    const user = req.user;

    if (!user.cityId) {
      return res.status(400).json(
        createErrorResponse('Please set your city in your profile to get city updates.', 'VALIDATION_ERROR', 400)
      );
    }

    console.log(`🏙️ City Updates - User: ${user.username}, City: ${user.cityId}`);

    const cityUpdates = await aiService.getCityUpdates(user.cityId);
    const suggestions = await aiService.getSmartSuggestions(user.cityId);

    res.json(createSuccessResponse({
      message: cityUpdates,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    }, 'City updates retrieved successfully'));

  } catch (error) {
    console.error('Get city updates error:', error);
    res.status(500).json(
      createErrorResponse('Failed to get city updates. Please try again.', 'INTERNAL_ERROR', 500)
    );
  }
};

// Get smart suggestions
const getSuggestions = async (req, res) => {
  try {
    const user = req.user;

    console.log(`💡 Smart Suggestions - User: ${user.username}`);

    const suggestions = await aiService.getSmartSuggestions(user.cityId);

    res.json(createSuccessResponse({
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    }, 'Smart suggestions retrieved successfully'));

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json(
      createErrorResponse('Failed to get suggestions. Please try again.', 'INTERNAL_ERROR', 500)
    );
  }
};

// Get AI help
const getHelp = async (req, res) => {
  try {
    const helpResponse = aiService.getHelpResponse();
    const suggestions = await aiService.getSmartSuggestions(req.user?.cityId);

    res.json(createSuccessResponse({
      message: helpResponse,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    }, 'Help information retrieved successfully'));

  } catch (error) {
    console.error('Get help error:', error);
    res.status(500).json(
      createErrorResponse('Failed to get help information. Please try again.', 'INTERNAL_ERROR', 500)
    );
  }
};

// Get AI status/health
const getStatus = async (req, res) => {
  try {
    res.json(createSuccessResponse({
      status: 'active',
      features: [
        'City updates',
        'Smart suggestions',
        'Natural language processing',
        'Real-time data'
      ],
      timestamp: new Date().toISOString()
    }, 'AI assistant is running'));

  } catch (error) {
    console.error('Get AI status error:', error);
    res.status(500).json(
      createErrorResponse('Failed to get AI status.', 'INTERNAL_ERROR', 500)
    );
  }
};

// Analyze report content to determine appropriate authority type
const analyzeReportAuthority = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json(
        createErrorResponse('Title, description, and category are required', 'VALIDATION_ERROR', 400)
      );
    }

    // Validate category
    const validCategories = ['GARBAGE', 'ROAD', 'WATER', 'POWER', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json(
        createErrorResponse('Invalid category', 'VALIDATION_ERROR', 400)
      );
    }

    console.log(`🤖 AI Analysis - Title: "${title}", Category: ${category}`);

    // Analyze the report content
    const analysis = await aiService.analyzeReportAuthority(title, description, category);

    // Get the authority type from database
    const authorityType = await prisma.authorityType.findFirst({
      where: {
        displayName: analysis.authorityType
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        icon: true
      }
    });

    if (!authorityType) {
      return res.status(404).json(
        createErrorResponse('Authority type not found', 'NOT_FOUND', 404)
      );
    }

    res.json(createSuccessResponse({
      analysis: {
        ...analysis,
        authorityTypeId: authorityType.id,
        authorityTypeDetails: authorityType
      }
    }));

  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json(
      createErrorResponse('Failed to analyze report authority', 'INTERNAL_ERROR', 500)
    );
  }
};

module.exports = {
  chat,
  getCityUpdates,
  getSuggestions,
  getHelp,
  getStatus,
  analyzeReportAuthority
};
