/**
 * Transcript Routes
 * Defines all transcript-related API endpoints
 */

import { Router } from 'express';
import * as transcriptController from '../controllers/transcriptController.js';
import { asyncHandler, validate, validationRules } from '../middleware/index.js';

const router = Router();

/**
 * @route   GET /api/v1/transcripts/conferences/summary
 * @desc    Get lean conferences summary (no raw transcript text)
 * @access  Public
 */
router.get(
  '/conferences/summary',
  asyncHandler(transcriptController.getConferenceSummary)
);

/**
 * @route   GET /api/v1/transcripts/conferences
 * @desc    Get all conferences (grouped transcripts)
 * @access  Public
 */
router.get(
  '/conferences',
  asyncHandler(transcriptController.getConferences)
);

/**
 * @route   GET /api/v1/transcripts/meta
 * @desc    Get aggregated metadata (speakers, topics, conferences, stats)
 * @access  Public
 */
router.get(
  '/meta',
  asyncHandler(transcriptController.getMeta)
);

/**
 * @route   GET /api/v1/transcripts/search
 * @desc    Search transcripts by query
 * @access  Public
 */
router.get(
  '/search',
  validationRules.search,
  validate,
  asyncHandler(transcriptController.searchTranscripts)
);

/**
 * @route   GET /api/v1/transcripts/:id
 * @desc    Get a single transcript by ID
 * @access  Public
 */
router.get(
  '/:id',
  validationRules.transcriptId,
  validate,
  asyncHandler(transcriptController.getTranscriptById)
);

/**
 * @route   GET /api/v1/transcripts
 * @desc    Get all raw transcripts
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(transcriptController.getAllTranscripts)
);

export default router;
