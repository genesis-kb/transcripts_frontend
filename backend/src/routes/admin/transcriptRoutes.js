/**
 * Admin transcript routes.
 */

import { Router } from 'express';
import {
  asyncHandler,
  validate,
  validationRules,
  requireAdminPermission,
} from '../../middleware/index.js';
import * as transcriptController from '../../controllers/admin/transcriptController.js';

const router = Router();

router.get(
  '/',
  validationRules.adminTranscriptList,
  validate,
  requireAdminPermission('transcripts:read'),
  asyncHandler(transcriptController.listTranscripts),
);

router.get(
  '/:id',
  validationRules.transcriptId,
  validate,
  requireAdminPermission('transcripts:read'),
  asyncHandler(transcriptController.getTranscriptById),
);

router.put(
  '/:id',
  validationRules.adminTranscriptUpdate,
  validate,
  requireAdminPermission('transcripts:write'),
  asyncHandler(transcriptController.updateTranscriptById),
);

router.delete(
  '/:id',
  validationRules.transcriptId,
  validate,
  requireAdminPermission('transcripts:delete'),
  asyncHandler(transcriptController.deleteTranscriptById),
);

export default router;
