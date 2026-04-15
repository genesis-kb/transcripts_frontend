/**
 * Admin authentication service.
 */

import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';
import config from '../../config/index.js';
import { APIError } from '../../middleware/errorHandler.js';

const compareSecrets = (expected, provided) => {
  const expectedBuf = Buffer.from(expected, 'utf8');
  const providedBuf = Buffer.from(provided, 'utf8');

  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, providedBuf);
};

export const validateAdminPassword = (password) => {
  if (!config.admin.password || !config.admin.jwtSecret) {
    throw new APIError('Admin authentication is not configured on the server', 503, 'AUTH_NOT_CONFIGURED');
  }

  const candidate = typeof password === 'string' ? password : '';

  if (!compareSecrets(config.admin.password, candidate)) {
    throw new APIError('Invalid admin credentials', 401, 'INVALID_CREDENTIALS');
  }
};

export const issueAdminToken = () => {
  const payload = {
    sub: 'admin',
    role: 'admin',
    permissions: ['*'],
  };

  const token = jwt.sign(payload, config.admin.jwtSecret, {
    expiresIn: config.admin.tokenTtl,
  });

  return {
    token,
    tokenType: 'Bearer',
    expiresIn: config.admin.tokenTtl,
  };
};

export default {
  validateAdminPassword,
  issueAdminToken,
};
