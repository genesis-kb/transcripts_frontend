/**
 * Admin authentication and authorization middleware.
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { APIError } from './errorHandler.js';

export const adminAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new APIError('Admin authentication token is required', 401, 'UNAUTHORIZED'));
  }

  if (!config.admin.jwtSecret) {
    return next(new APIError('Admin authentication is not configured on the server', 503, 'AUTH_NOT_CONFIGURED'));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.admin.jwtSecret);
    req.admin = payload;
    return next();
  } catch (error) {
    return next(new APIError('Invalid or expired admin token', 401, 'INVALID_TOKEN'));
  }
};

export const requireAdminPermission = (permission) => (req, res, next) => {
  const permissions = Array.isArray(req.admin?.permissions) ? req.admin.permissions : [];
  if (permissions.includes(permission) || permissions.includes('*')) {
    return next();
  }

  return next(new APIError('Insufficient admin permissions', 403, 'FORBIDDEN'));
};

export default {
  adminAuth,
  requireAdminPermission,
};
