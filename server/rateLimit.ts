import { rateLimit } from 'express-rate-limit';
import { logger } from './logger';

/**
 * Rate limiting configuration for different endpoint types
 * Sprint 4 - Production: Comprehensive rate limiting
 */

// Global rate limiter - applies to all requests
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Rate limit exceeded');
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

// Strict limiter for write operations (POST, PUT, DELETE)
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 write operations per 15 minutes
  message: 'Too many write operations from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to write operations
    return !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  },
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Write rate limit exceeded');
    res.status(429).json({
      error: 'Too many write operations from this IP, please try again later',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

// OAuth/Authentication limiter - stricter for security-sensitive endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per 15 minutes
  message: 'Too many authentication attempts from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Auth rate limit exceeded');
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again later',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

// API limiter - for external API calls
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 API calls per minute
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'API rate limit exceeded');
    res.status(429).json({
      error: 'Too many API requests, please try again later',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});
