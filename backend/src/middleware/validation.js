/**
 * Request Validation Middleware
 * Uses express-validator for input validation
 */

import { validationResult, body, param, query } from 'express-validator';
import { APIError } from './errorHandler.js';

/**
 * Middleware to check validation results
 * Wrapped in try-catch to ensure errors are properly passed to error handler
 */
export const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      const error = new APIError(
        `Validation failed: ${messages.map((m) => m.message).join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
      return next(error);
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validation rules for different endpoints
 */
export const validationRules = {
  // Transcript ID parameter
  transcriptId: [
    param('id')
      .notEmpty()
      .withMessage('Transcript ID is required')
      .isUUID()
      .withMessage('Transcript ID must be a valid UUID'),
  ],

  // Search query
  search: [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Search query must be between 2 and 200 characters')
      .trim()
      .escape(),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],

  // Summary generation
  generateSummary: [
    body('transcript')
      .notEmpty()
      .withMessage('Transcript text is required')
      .isLength({ min: 100 })
      .withMessage('Transcript must be at least 100 characters'),
    body('transcriptId')
      .optional()
      .isUUID()
      .withMessage('Transcript ID must be a valid UUID'),
  ],

  // Chat with transcript
  chat: [
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters')
      .trim(),
    body('transcript')
      .notEmpty()
      .withMessage('Transcript context is required')
      .isLength({ min: 100 })
      .withMessage('Transcript must be at least 100 characters'),
    body('history')
      .optional()
      .isArray()
      .withMessage('History must be an array'),
  ],

  // Text-to-speech
  tts: [
    body('text')
      .notEmpty()
      .withMessage('Text is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Text must be between 1 and 5000 characters')
      .trim(),
  ],

  // Admin login
  adminLogin: [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8, max: 200 })
      .withMessage('Password must be between 8 and 200 characters'),
  ],

  // Admin transcript list
  adminTranscriptList: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'done'])
      .withMessage('Status must be one of: pending, processing, done'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Search must be between 1 and 200 characters')
      .trim(),
  ],

  // Admin transcript update
  adminTranscriptUpdate: [
    param('id')
      .notEmpty()
      .withMessage('Transcript ID is required')
      .isUUID()
      .withMessage('Transcript ID must be a valid UUID'),
    body('title')
      .optional()
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Title must be between 1 and 500 characters')
      .trim(),
    body('conference')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Conference must be at most 255 characters')
      .trim(),
    body('loc')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Location must be at most 255 characters')
      .trim(),
    body('channel_name')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Channel name must be at most 255 characters')
      .trim(),
    body('speakers')
      .optional()
      .isArray()
      .withMessage('Speakers must be an array'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('categories')
      .optional()
      .isArray()
      .withMessage('Categories must be an array'),
    body('event_date')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Event date must be a valid date'),
    body('status')
      .optional()
      .isIn(['pending', 'processing', 'done'])
      .withMessage('Status must be one of: pending, processing, done'),
    body('summary')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 20000 })
      .withMessage('Summary must be at most 20000 characters'),
    body('raw_text')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 2000000 })
      .withMessage('Raw text must be at most 2000000 characters'),
    body('corrected_text')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 2000000 })
      .withMessage('Corrected text must be at most 2000000 characters'),
    body('media_url')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Media URL must be at most 1000 characters'),
    body('duration_seconds')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer'),
  ],
};

export default {
  validate,
  validationRules,
};
