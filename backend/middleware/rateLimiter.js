const rateLimit = require('express-rate-limit');

// General rate limiter for public routes - DISABLED for development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth routes - DISABLED for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited for development
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limiter for API routes - DISABLED for development
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited for development
  message: {
    error: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Heavy GET routes (reports, comments, search) - DISABLED for development
const heavyGetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 999999, // Essentially unlimited for development
  message: {
    error: 'Too many requests for this endpoint, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST routes (create, update, delete) - DISABLED for development
const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 999999, // Essentially unlimited for development
  message: {
    error: 'Too many requests for this endpoint, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter - DISABLED for development
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited for development
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
