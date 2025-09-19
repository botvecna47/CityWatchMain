// Standardized error response format
const createErrorResponse = (
  message,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details = null
) => {
  return {
    success: false,
    error: {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    },
  };
};

// Common error codes
const ERROR_CODES = {
  // Authentication errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Permission errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED: 'ROLE_REQUIRED',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err?.message,
    stack: err?.stack,
    url: req?.url,
    method: req?.method,
    timestamp: new Date().toISOString()
  });

  // Check if response object is valid
  if (!res || typeof res.status !== 'function') {
    console.error('Invalid response object in error handler');
    return next(err);
  }

  // Default error response
  let statusCode = 500;
  let errorCode = ERROR_CODES.INTERNAL_ERROR;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.INVALID_INPUT;
    message = 'Invalid input format';
  } else if (err.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    errorCode = ERROR_CODES.ALREADY_EXISTS;
    message = 'Resource already exists';
  } else if (err.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    errorCode = ERROR_CODES.NOT_FOUND;
    message = 'Resource not found';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.INVALID_TOKEN;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = 'Token expired';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
    message = err.message || message;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  const errorResponse = createErrorResponse(message, errorCode, statusCode);

  res.status(statusCode).json(errorResponse);
};

// Success response helper
const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  createErrorResponse,
  createSuccessResponse,
  ERROR_CODES,
  errorHandler,
  asyncHandler
};
