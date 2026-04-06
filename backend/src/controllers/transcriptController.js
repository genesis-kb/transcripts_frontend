/**
 * Transcripts Controller
 * Handles all transcript-related API endpoints
 */

import * as supabaseService from '../services/supabaseService.js';
import { transformToConferences } from '../utils/dataProcessor.js';
import { sendSuccess } from '../utils/responseHelper.js';
import { APIError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * Get all conferences (grouped transcripts)
 * GET /api/v1/transcripts/conferences
 */
export const getConferences = async (req, res) => {
  logger.info('Controller: Getting all conferences');

  const transcripts = await supabaseService.fetchAllTranscripts();

  if (!transcripts || transcripts.length === 0) {
    logger.warn('No transcripts found in database');
    return sendSuccess(res, [], 'No transcripts found');
  }

  const conferences = transformToConferences(transcripts);

  sendSuccess(res, conferences, `Found ${conferences.length} conferences`);
};

/**
 * Get all raw transcripts
 * GET /api/v1/transcripts
 */
export const getAllTranscripts = async (req, res) => {
  logger.info('Controller: Getting all transcripts');

  const transcripts = await supabaseService.fetchAllTranscripts();

  sendSuccess(res, transcripts, `Found ${transcripts.length} transcripts`);
};

/**
 * Get a single transcript by ID
 * GET /api/v1/transcripts/:id
 */
export const getTranscriptById = async (req, res) => {
  const { id } = req.params;

  logger.info(`Controller: Getting transcript by ID: ${id}`);

  const transcript = await supabaseService.fetchTranscriptById(id);

  if (!transcript) {
    throw new APIError(`Transcript not found with ID: ${id}`, 404, 'NOT_FOUND');
  }

  sendSuccess(res, transcript);
};

/**
 * Search transcripts (Full-Text Search with pagination & snippets)
 * GET /api/v1/transcripts/search?q=query&page=1&limit=20
 */
export const searchTranscripts = async (req, res) => {
  const { q, page = '1', limit = '20' } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  logger.info(`Controller: FTS search for: "${q}" (page=${pageNum}, limit=${limitNum})`);

  const { results, total } = await supabaseService.searchTranscripts(q, limitNum, offset);

  const totalPages = Math.ceil(total / limitNum);

  sendSuccess(res, {
    results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  });
};

/**
 * Get aggregated metadata (speakers, topics, conferences, stats)
 * GET /api/v1/transcripts/meta
 */
export const getMeta = async (req, res) => {
  logger.info('Controller: Getting transcript metadata');

  const meta = await supabaseService.fetchTranscriptMeta();

  sendSuccess(res, meta);
};

export default {
  getConferences,
  getAllTranscripts,
  getTranscriptById,
  searchTranscripts,
  getMeta,
};
