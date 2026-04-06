/**
 * AI Routes
 * Only summary endpoint remains — uses pre-generated summaries from DB.
 * Chat, TTS, and entities are disabled.
 */

import { Router } from 'express';
import { sendSuccess } from '../utils/responseHelper.js';
import { APIError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/index.js';
import * as supabaseService from '../services/supabaseService.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * @route   POST /api/v1/ai/summary
 * @desc    Return pre-generated summary from DB (no Gemini call)
 */
router.post(
  '/summary',
  asyncHandler(async (req, res) => {
    const { transcriptId } = req.body;

    if (!transcriptId) {
      throw new APIError('transcriptId is required', 400, 'VALIDATION_ERROR');
    }

    logger.info(`Fetching DB summary for transcript: ${transcriptId}`);

    const transcript = await supabaseService.fetchTranscriptById(transcriptId);

    if (!transcript) {
      throw new APIError('Transcript not found', 404, 'NOT_FOUND');
    }

    const summary = transcript.summary || null;

    if (!summary) {
      return sendSuccess(res, { summary: 'No summary available for this transcript.', cached: false });
    }

    sendSuccess(res, { summary, cached: true });
  })
);

/**
 * Chat, TTS, and entities are disabled.
 */
router.post('/chat', (req, res) => {
  res.status(503).json({ success: false, message: 'Chat is currently disabled.' });
});

router.post('/tts', (req, res) => {
  res.status(503).json({ success: false, message: 'Text-to-speech is currently disabled.' });
});

router.post('/entities', (req, res) => {
  res.status(503).json({ success: false, message: 'Entity extraction is currently disabled.' });
});

export default router;
