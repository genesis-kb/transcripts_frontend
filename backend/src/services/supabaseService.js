/**
 * Database Service
 * Handles all database operations with PostgreSQL (AWS RDS)
 *
 * Note: File kept as supabaseService.js to avoid changing controller imports.
 */

import pg from 'pg';
import config from '../config/index.js';
import logger from '../config/logger.js';

const { Pool } = pg;

let pool = null;

/**
 * Get or create the connection pool
 */
const getPool = () => {
  if (!pool) {
    if (!config.database.url) {
      logger.error('DATABASE_URL is missing. Please check your .env file.');
      throw new Error('DATABASE_URL configuration is missing');
    }

    pool = new Pool({
      connectionString: config.database.url,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
      logger.error('Unexpected pool error:', { error: err.message });
    });

    logger.info('PostgreSQL connection pool initialized');
  }

  return pool;
};

/**
 * Execute a query with timeout
 */
const query = async (text, params = [], timeoutMs = 10000) => {
  const client = await getPool().connect();
  try {
    await client.query(`SET statement_timeout = ${timeoutMs}`);
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

/**
 * Fetch all transcripts from the database
 * @returns {Promise<Array>} Array of transcript records
 */
export const fetchAllTranscripts = async () => {
  logger.info('Fetching all transcripts from database...');

  const result = await query(
    `SELECT * FROM transcripts ORDER BY event_date DESC`
  );

  logger.info(`Successfully fetched ${result.rows.length} transcripts`);
  return result.rows;
};

/**
 * Fetch a single transcript by ID
 * @param {string} id - Transcript ID
 * @returns {Promise<Object|null>} Transcript record or null
 */
export const fetchTranscriptById = async (id) => {
  logger.info(`Fetching transcript with ID: ${id}`);

  const result = await query(
    `SELECT * FROM transcripts WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    logger.warn(`Transcript not found: ${id}`);
    return null;
  }

  return result.rows[0];
};

/**
 * Search transcripts using PostgreSQL Full-Text Search.
 * Returns ranked results with highlighted snippets.
 * @param {string} searchQuery - Search query
 * @param {number} limit - Max results per page
 * @param {number} offset - Offset for pagination
 * @returns {Promise<{results: Array, total: number}>}
 */
export const searchTranscripts = async (searchQuery, limit = 20, offset = 0) => {
  const sanitized = searchQuery
    .replace(/[<>"'`;(){}[\]\\]/g, '')
    .trim()
    .substring(0, 200);

  if (!sanitized || sanitized.length < 2) {
    logger.warn('Search query too short or invalid after sanitization');
    return { results: [], total: 0 };
  }

  logger.info(`FTS searching for: "${sanitized}" (limit=${limit}, offset=${offset})`);

  const [searchResult, countResult] = await Promise.all([
    query(
      `SELECT
        id, title, speakers, event_date, loc, tags, categories,
        conference, topics, channel_name, status,
        ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(raw_text, '') || ' ' || coalesce(corrected_text, '')),
                plainto_tsquery('english', $1)) AS rank,
        ts_headline('english', coalesce(corrected_text, raw_text, ''),
                    plainto_tsquery('english', $1),
                    'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20') AS snippet
      FROM transcripts
      WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(raw_text, '') || ' ' || coalesce(corrected_text, ''))
            @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2 OFFSET $3`,
      [sanitized, limit, offset]
    ),
    query(
      `SELECT COUNT(*) AS total
      FROM transcripts
      WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(raw_text, '') || ' ' || coalesce(corrected_text, ''))
            @@ plainto_tsquery('english', $1)`,
      [sanitized]
    ),
  ]);

  const results = searchResult.rows;
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  logger.info(`FTS search returned ${results.length} results (total: ${total})`);
  return { results, total };
};

/**
 * Get cached AI content (summary, etc.) for a transcript
 * @param {string} transcriptId - Transcript ID
 * @param {string} type - Content type (summary, entities, etc.)
 * @returns {Promise<string|null>} Cached content or null
 */
export const getCachedAIContent = async (transcriptId, type) => {
  try {
    const result = await query(
      `SELECT content FROM ai_cache WHERE transcript_id = $1 AND type = $2`,
      [transcriptId, type]
    );
    return result.rows[0]?.content || null;
  } catch (err) {
    logger.warn('Cache lookup error:', { error: err.message });
    return null;
  }
};

/**
 * Store AI content in cache
 * @param {string} transcriptId - Transcript ID
 * @param {string} type - Content type
 * @param {string} content - Content to cache
 */
export const cacheAIContent = async (transcriptId, type, content) => {
  try {
    await query(
      `INSERT INTO ai_cache (transcript_id, type, content, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (transcript_id, type)
       DO UPDATE SET content = EXCLUDED.content, created_at = NOW()`,
      [transcriptId, type, content]
    );
    logger.debug(`Cached ${type} for transcript ${transcriptId}`);
  } catch (err) {
    logger.warn('Cache store error:', { error: err.message });
    // Don't throw - caching failure shouldn't break the main flow
  }
};

/**
 * Health check for database connection
 * @returns {Promise<boolean>} True if connection is healthy
 */
export const healthCheck = async () => {
  try {
    const result = await query('SELECT 1');
    return result.rows.length > 0;
  } catch (err) {
    logger.error('Database health check failed:', { error: err.message });
    return false;
  }
};

export default {
  fetchAllTranscripts,
  fetchTranscriptById,
  searchTranscripts,
  getCachedAIContent,
  cacheAIContent,
  healthCheck,
};
