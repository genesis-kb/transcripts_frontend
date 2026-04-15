/**
 * Admin authentication controller.
 */

import { sendSuccess } from '../../utils/responseHelper.js';
import { validateAdminPassword, issueAdminToken } from '../../services/admin/authService.js';

export const login = async (req, res) => {
  const { password } = req.body;

  validateAdminPassword(password);
  const token = issueAdminToken();

  return sendSuccess(res, token, 'Admin login successful');
};

export default {
  login,
};
