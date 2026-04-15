/**
 * Admin routes index.
 * All routes in this module are isolated under /api/v1/admin.
 */

import { Router } from 'express';
import {
  adminAuth,
  adminLimiter,
  requireAdminPermission,
} from '../middleware/index.js';
import authRoutes from './admin/authRoutes.js';
import transcriptRoutes from './admin/transcriptRoutes.js';
import healthRoutes from './admin/healthRoutes.js';
import { sendSuccess } from '../utils/responseHelper.js';

const router = Router();

router.use('/auth', authRoutes);

// All non-auth admin endpoints require token + admin rate limiter.
router.use(adminAuth);
router.use(adminLimiter);

router.use('/transcripts', transcriptRoutes);
router.use('/health', requireAdminPermission('health:read'), healthRoutes);

router.get('/', (req, res) => {
  sendSuccess(res, {
    area: 'admin',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/v1/admin/auth/login': 'Admin login',
      },
      transcripts: {
        'GET /api/v1/admin/transcripts': 'List transcripts',
        'GET /api/v1/admin/transcripts/:id': 'Get transcript details',
        'PUT /api/v1/admin/transcripts/:id': 'Update transcript',
        'DELETE /api/v1/admin/transcripts/:id': 'Delete transcript',
      },
      health: {
        'GET /api/v1/admin/health': 'Basic health check',
        'GET /api/v1/admin/health/detailed': 'Detailed health check',
      },
    },
  });
});

export default router;
