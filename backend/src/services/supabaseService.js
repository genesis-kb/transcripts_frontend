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
  const startedAt = Date.now();
  try {
    await client.query(`SET statement_timeout = ${timeoutMs}`);
    const result = await client.query(text, params);
    const durationMs = Date.now() - startedAt;
    if (durationMs >= 1000) {
      logger.info('Slow database query completed', {
        durationMs,
        rowCount: result.rowCount,
      });
    }
    return result;
  } finally {
    client.release();
  }
};

/**
 * Fetch conference summaries without raw transcript text
 * @param {Object} options - Pagination options
 * @param {number} [options.limit] - Optional result limit
 * @param {number} [options.offset=0] - Optional result offset
 * @returns {Promise<Array>} Summary rows
 */
export const fetchTranscriptSummaries = async ({ limit, offset = 0 } = {}) => {
  logger.info('Fetching lean transcript summaries from database...');

  const params = [];
  let sql = `
      SELECT id, title, speakers, event_date, conference, channel_name, loc,
        tags, topics, categories, summary
    FROM transcripts
    ORDER BY event_date DESC
  `;

  if (typeof limit === 'number') {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  if (typeof offset === 'number' && offset > 0) {
    params.push(offset);
    sql += ` OFFSET $${params.length}`;
  }

  const result = await query(sql, params);

  logger.info(`Successfully fetched ${result.rows.length} lean transcript rows`);
  return result.rows;
};

/**
 * Break text into paragraphs of ~5 sentences each.
 * If the last chunk has fewer than 3 sentences, merge it into the previous one.
 */
const addParagraphBreaks = (text) => {
  if (!text) return text;

  // Split into sentences (keep the delimiter attached)
  const sentences = text.split(/(?<=[.?!])\s+/).filter((s) => s.trim());
  if (sentences.length <= 6) return text;

  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 5) {
    paragraphs.push(sentences.slice(i, i + 5).join(' '));
  }

  // If last paragraph is too short, merge it with the previous one
  if (paragraphs.length > 1 && paragraphs[paragraphs.length - 1].split(/[.?!]/).length <= 3) {
    const last = paragraphs.pop();
    paragraphs[paragraphs.length - 1] += ' ' + last;
  }

  return paragraphs.join('\n\n');
};

/**
 * Strip speaker/timestamp labels like "Speaker 0: 00:01:23" from transcript text.
 * Handles labels at start, inline, and with surrounding whitespace/newlines.
 */
const stripSpeakerLabels = (text) => {
  if (!text) return text;
  return text
    .replace(/\n*Speaker \d+:\s*\d{2}:\d{2}:\d{2}\n*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

/**
 * Format a transcript row — clean up labels and add paragraph breaks.
 */
const formatTranscript = (row) => {
  if (!row) return row;
  return {
    ...row,
    raw_text: row.raw_text ? addParagraphBreaks(stripSpeakerLabels(row.raw_text)) : row.raw_text,
    corrected_text: row.corrected_text ? addParagraphBreaks(stripSpeakerLabels(row.corrected_text)) : row.corrected_text,
  };
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
  return result.rows.map(formatTranscript);
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

  return formatTranscript(result.rows[0]);
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

  const ftsVector = `to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(conference, '') || ' ' ||
      coalesce(channel_name, '') || ' ' ||
      coalesce(array_to_string(speakers, ' '), '') || ' ' ||
      coalesce(array_to_string(tags, ' '), '') || ' ' ||
      coalesce(array_to_string(topics, ' '), '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(raw_text, '') || ' ' ||
      coalesce(corrected_text, ''))`;

  const [searchResult, countResult] = await Promise.all([
    query(
      `SELECT
        id, title, speakers, event_date, loc, tags, categories,
        conference, topics, channel_name, status, summary,
        ts_rank(${ftsVector}, plainto_tsquery('english', $1)) AS rank,
        ts_headline('english', coalesce(corrected_text, raw_text, ''),
                    plainto_tsquery('english', $1),
                    'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20') AS snippet
      FROM transcripts
      WHERE ${ftsVector} @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2 OFFSET $3`,
      [sanitized, limit, offset]
    ),
    query(
      `SELECT COUNT(*) AS total
      FROM transcripts
      WHERE ${ftsVector} @@ plainto_tsquery('english', $1)`,
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

/**
 * Fetch aggregated metadata from all transcripts:
 * unique speakers, topics, categories (conferences), stats.
 * Derived entirely from actual DB data.
 */
export const fetchTranscriptMeta = async () => {
  logger.info('Fetching transcript metadata aggregates...');

  const result = await query(`
    SELECT
      speakers, tags, topics, conference, channel_name, categories, loc
    FROM transcripts
  `);

  const rows = result.rows;
  const speakerMap = {};
  const topicMap = {};
  const conferenceSet = {};
  const tagSet = {};

  const normalizeLabel = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  const cleanLabel = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ');
  };

  for (const row of rows) {
    // Speakers
    if (Array.isArray(row.speakers)) {
      for (const s of row.speakers) {
        const speakerName = cleanLabel(s);
        const speakerKey = normalizeLabel(speakerName);
        if (!speakerKey) continue;
        if (!speakerMap[speakerKey]) speakerMap[speakerKey] = { name: speakerName, transcriptCount: 0, topics: new Set() };
        speakerMap[speakerKey].transcriptCount++;
        if (Array.isArray(row.topics)) {
          row.topics.forEach((t) => {
            const topicName = cleanLabel(t);
            if (topicName) speakerMap[speakerKey].topics.add(topicName);
          });
        }
      }
    }

    // Topics
    if (Array.isArray(row.topics)) {
      for (const t of row.topics) {
        const topicName = cleanLabel(t);
        const topicKey = normalizeLabel(topicName);
        if (!topicKey) continue;
        if (!topicMap[topicKey]) topicMap[topicKey] = { name: topicName, count: 0 };
        topicMap[topicKey].count++;
      }
    }

    // Tags — combine tags and topics since tags is often empty
    for (const arr of [row.tags, row.topics]) {
      if (Array.isArray(arr)) {
        for (const t of arr) {
          const tagName = cleanLabel(t);
          const tagKey = normalizeLabel(tagName);
          if (!tagKey) continue;
          if (!tagSet[tagKey]) tagSet[tagKey] = { name: tagName, count: 0 };
          tagSet[tagKey].count++;
        }
      }
    }

    // Conferences (from conference or channel_name field)
    const confName = cleanLabel(row.conference || row.channel_name);
    const confKey = normalizeLabel(confName);
    if (confKey) {
      if (!conferenceSet[confKey]) conferenceSet[confKey] = { name: confName, count: 0, loc: row.loc };
      conferenceSet[confKey].count++;
    }
  }

  const speakers = Object.values(speakerMap).map((s) => ({
    name: s.name,
    slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    transcriptCount: s.transcriptCount,
    topics: [...s.topics].slice(0, 5),
  })).sort((a, b) => b.transcriptCount - a.transcriptCount);

  const topics = Object.values(topicMap).map(({ name, count }) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    count,
  })).sort((a, b) => b.count - a.count);

  const conferences = Object.values(conferenceSet).map((c) => ({
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    sessions: c.count,
    location: c.loc || '',
  })).sort((a, b) => b.sessions - a.sessions);

  const tags = Object.values(tagSet).map(({ name, count }) => ({
    name,
    count,
  })).sort((a, b) => b.count - a.count);

  const stats = {
    totalTranscripts: rows.length,
    totalSpeakers: speakers.length,
    totalConferences: conferences.length,
    totalTopics: topics.length,
  };

  return { speakers, topics, conferences, tags, stats };
};

export default {
  fetchTranscriptSummaries,
  fetchAllTranscripts,
  fetchTranscriptById,
  searchTranscripts,
  getCachedAIContent,
  cacheAIContent,
  healthCheck,
  fetchTranscriptMeta,
};
