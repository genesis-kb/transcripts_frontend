/**
 * Admin API rate limiter.
 */

import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

export const adminLimiter = rateLimit({
  windowMs: config.admin.rateLimit.windowMs,
  max: config.admin.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const adminId = req.admin?.sub || req.admin?.username || 'anonymous';
    return `${adminId}-${req.ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many admin requests. Please try again later.',
      },
    });
  },
});

export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again later.',
      },
    });
  },
});

export default {
  adminLimiter,
  adminAuthLimiter,
};
