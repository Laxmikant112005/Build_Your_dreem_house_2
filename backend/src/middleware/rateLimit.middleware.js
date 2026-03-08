/**
 * BuildMyHome - Rate Limiting Middleware
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * General API rate limiter
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 429,
        message: 'Too many requests. Please try again later.',
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload rate limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many upload requests. Please try again later.',
    },
  },
});

module.exports = {
  rateLimiter,
  authLimiter,
  uploadLimiter,
};

