/**
 * Routes Index
 * Combines all route modules into a single router
 */

import { Router } from 'express';
import transcriptRoutes from './transcriptRoutes.js';
import aiRoutes from './aiRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Mount route modules
router.use('/transcripts', transcriptRoutes);
router.use('/ai', aiRoutes);
router.use('/health', healthRoutes);

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bitcoin Transcripts API v1',
    version: '1.0.0',
    documentation: {
      endpoints: {
        transcripts: {
          'GET /api/v1/transcripts/conferences/summary': 'Get lean conference summary',
          'GET /api/v1/transcripts': 'Get all raw transcripts',
          'GET /api/v1/transcripts/conferences': 'Get transcripts grouped by conference',
          'GET /api/v1/transcripts/search?q=query': 'Search transcripts',
          'GET /api/v1/transcripts/:id': 'Get single transcript by ID',
        },
        ai: {
          'POST /api/v1/ai/summary': 'Generate transcript summary',
          'POST /api/v1/ai/chat': 'Chat with transcript context',
          'POST /api/v1/ai/tts': 'Generate speech from text',
          'POST /api/v1/ai/entities': 'Extract entities from transcript',
        },
        health: {
          'GET /api/v1/health': 'Basic health check',
          'GET /api/v1/health/detailed': 'Detailed service health check',
        },
      },
    },
  });
});

export default router;
