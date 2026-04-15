/**
 * Admin transcript service.
 * Provides CRUD and listing for admin namespace.
 */

import { query } from '../supabaseService.js';

const ALLOWED_UPDATE_FIELDS = [
  'title',
  'conference',
  'loc',
  'channel_name',
  'speakers',
  'tags',
  'categories',
  'event_date',
  'status',
  'summary',
  'raw_text',
  'corrected_text',
  'media_url',
  'duration_seconds',
];

const normalizeArrayValue = (value) => {
  if (!Array.isArray(value)) return value;
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeUpdatePayload = (payload) => {
  const updates = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      if (['speakers', 'tags', 'categories'].includes(field)) {
        updates[field] = normalizeArrayValue(payload[field]);
      } else {
        updates[field] = payload[field];
      }
    }
  }

  return updates;
};

export const listTranscripts = async ({ page, limit, status, search }) => {
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    where.push(`title ILIKE $${params.length}`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  params.push(limit);
  params.push(offset);

  const rowsResult = await query(
    `SELECT
      t.id,
      t.title,
      t.conference,
      t.speakers,
      t.event_date,
      t.status,
      t.created_at,
      COUNT(*) OVER()::int AS __total_count
     FROM transcripts t
     ${whereClause}
     ORDER BY t.event_date DESC NULLS LAST, t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const total = rowsResult.rows.length > 0 ? rowsResult.rows[0].__total_count : 0;
  const pages = Math.max(1, Math.ceil(total / limit));

  const transcripts = rowsResult.rows.map(({ __total_count, ...row }) => row);

  return {
    transcripts,
    total,
    pages,
  };
};

export const getTranscriptById = async (id) => {
  const result = await query(
    'SELECT * FROM transcripts WHERE id = $1',
    [id],
  );

  return result.rows[0] || null;
};

export const updateTranscriptById = async (id, payload) => {
  const updates = normalizeUpdatePayload(payload);
  const entries = Object.entries(updates).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return getTranscriptById(id);
  }

  const setClauses = entries.map(([field], index) => `${field} = $${index + 2}`);
  const values = entries.map(([, value]) => value);

  const result = await query(
    `UPDATE transcripts
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, ...values],
  );

  return result.rows[0] || null;
};

export const deleteTranscriptById = async (id) => {
  const result = await query(
    'DELETE FROM transcripts WHERE id = $1 RETURNING id',
    [id],
  );

  return result.rows.length > 0;
};

export default {
  listTranscripts,
  getTranscriptById,
  updateTranscriptById,
  deleteTranscriptById,
};
