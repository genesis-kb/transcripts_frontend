/**
 * Admin health routes.
 */

import { Router } from 'express';
import * as healthController from '../../controllers/healthController.js';
import { asyncHandler } from '../../middleware/index.js';

const router = Router();

router.get('/', healthController.healthCheck);
router.get('/detailed', asyncHandler(healthController.detailedHealthCheck));

export default router;
