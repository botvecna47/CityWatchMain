const rateLimit = require('express-rate-limit');

// General rate limiter for public routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    error: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Heavy GET routes (reports, comments, search) - more restrictive
const heavyGetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for heavy GET operations
  message: {
    error: 'Too many requests for this endpoint, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST routes (create, update, delete) - stricter limits
const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 POST requests per minute
  message: {
    error: 'Too many requests for this endpoint, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 uploads per windowMs (increased for development)
  message: {
    error: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  heavyGetLimiter,
  postLimiter,
  uploadLimiter
};
