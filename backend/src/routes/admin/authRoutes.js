/**
 * Admin auth routes.
 */

import { Router } from 'express';
import { asyncHandler, validate, validationRules, adminAuthLimiter } from '../../middleware/index.js';
import * as authController from '../../controllers/admin/authController.js';

const router = Router();

router.post(
  '/login',
  adminAuthLimiter,
  validationRules.adminLogin,
  validate,
  asyncHandler(authController.login),
);

export default router;
