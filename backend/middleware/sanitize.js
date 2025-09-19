// Sanitize HTML content (remove all HTML tags)
const sanitizeHtml = (html) => {
  if (typeof html !== 'string') {
    return html;
  }
  return html.replace(/<[^>]*>/g, '');
};

// Sanitize text content (remove HTML tags and dangerous characters)
const sanitizeText = (text) => {
  if (typeof text !== 'string') {
    return text;
  }
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  return obj;
};

// Middleware to sanitize request body
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware to sanitize query parameters
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Middleware to sanitize URL parameters
const sanitizeParams = (req, res, next) => {
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Combined sanitization middleware
const sanitizeAll = (req, res, next) => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
};

module.exports = {
  sanitizeHtml,
  sanitizeText,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll
};
