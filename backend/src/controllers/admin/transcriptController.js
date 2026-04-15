/**
 * Admin transcript controller.
 */

import { APIError } from '../../middleware/errorHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as transcriptService from '../../services/admin/transcriptService.js';

export const listTranscripts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const status = req.query.status || undefined;
  const search = req.query.search?.trim() || undefined;

  const data = await transcriptService.listTranscripts({
    page,
    limit,
    status,
    search,
  });

  return sendSuccess(res, data, `Found ${data.total} transcripts`);
};

export const getTranscriptById = async (req, res) => {
  const transcript = await transcriptService.getTranscriptById(req.params.id);

  if (!transcript) {
    throw new APIError('Transcript not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, transcript);
};

export const updateTranscriptById = async (req, res) => {
  const transcript = await transcriptService.updateTranscriptById(req.params.id, req.body);

  if (!transcript) {
    throw new APIError('Transcript not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, transcript, 'Transcript updated successfully');
};

export const deleteTranscriptById = async (req, res) => {
  const deleted = await transcriptService.deleteTranscriptById(req.params.id);

  if (!deleted) {
    throw new APIError('Transcript not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, { id: req.params.id }, 'Transcript deleted successfully');
};

export default {
  listTranscripts,
  getTranscriptById,
  updateTranscriptById,
  deleteTranscriptById,
};
