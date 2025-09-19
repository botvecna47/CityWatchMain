// Sanitize HTML content (remove all HTML tags)
const sanitizeHtml = (html) => {
  if (typeof html !== 'string') {
    return html;
  }
  return html.replace(/<[^>]*>/g, '');
};

// Enhanced sanitize text content (remove HTML tags and dangerous characters)
const sanitizeText = (text) => {
  if (typeof text !== 'string') {
    return text;
  }
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove CSS url() functions
    .replace(/@import/gi, '') // Remove CSS imports
    .replace(/eval\s*\(/gi, '') // Remove eval() calls
    .replace(/setTimeout\s*\(/gi, '') // Remove setTimeout calls
    .replace(/setInterval\s*\(/gi, '') // Remove setInterval calls
    .replace(/Function\s*\(/gi, '') // Remove Function constructor
    .replace(/document\./gi, '') // Remove document object access
    .replace(/window\./gi, '') // Remove window object access
    .replace(/\.innerHTML/gi, '') // Remove innerHTML access
    .replace(/\.outerHTML/gi, '') // Remove outerHTML access
    .replace(/\.insertAdjacentHTML/gi, '') // Remove insertAdjacentHTML
    .replace(/\.write/gi, '') // Remove document.write
    .replace(/\.writeln/gi, '') // Remove document.writeln
    .replace(/\\x[0-9a-fA-F]{2}/g, '') // Remove hex encoded characters
    .replace(/\\u[0-9a-fA-F]{4}/g, '') // Remove unicode encoded characters
    .replace(/\\[0-7]{1,3}/g, '') // Remove octal encoded characters
    .replace(/%[0-9a-fA-F]{2}/g, '') // Remove URL encoded characters
    .replace(/&#x[0-9a-fA-F]+;/g, '') // Remove hex HTML entities
    .replace(/&#[0-9]+;/g, '') // Remove decimal HTML entities
    .replace(/&[a-zA-Z][a-zA-Z0-9]*;/g, '') // Remove named HTML entities
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
