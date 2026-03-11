/**
 * Data Service
 * Handles all data fetching operations via the backend API
 * No longer connects directly to Supabase - all requests go through the backend
 */

import { api, APIError } from './api';
import config from './config';
import type { Conference, Talk, RawTranscript } from '../types';

/**
 * Fetch all conferences (grouped transcripts)
 * @returns Promise with array of conferences
 */
export const getConferences = async (): Promise<Conference[]> => {
  try {
    const conferences = await api.get<Conference[]>(config.endpoints.conferences);
    return conferences;
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API Error fetching conferences:', error.message, error.code);
      if (error.code === 'CONNECTION_ERROR') {
        console.error('Backend server is not running. Please start the backend with: cd backend && npm run dev');
      }
    } else {
      console.error('Unexpected error fetching conferences:', error);
    }
    return [];
  }
};

/**
 * Fetch all raw transcripts
 * @returns Promise with array of raw transcripts
 */
export const getAllTranscripts = async (): Promise<RawTranscript[]> => {
  try {
    const transcripts = await api.get<RawTranscript[]>(config.endpoints.transcripts);
    return transcripts;
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API Error fetching transcripts:', error.message, error.code);
    } else {
      console.error('Unexpected error fetching transcripts:', error);
    }
    return [];
  }
};

/**
 * Fetch a single transcript by ID (raw DB row)
 * @param id - Transcript UUID
 * @returns Promise with raw transcript or null
 */
export const getTranscriptById = async (id: string): Promise<RawTranscript | null> => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.warn('Invalid transcript ID format:', id);
    return null;
  }

  try {
    const transcript = await api.get<RawTranscript>(`${config.endpoints.transcripts}/${id}`);
    return transcript;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 404) {
      console.warn('Transcript not found:', id);
      return null;
    }
    // Re-throw network / server errors so the caller can distinguish
    // "not found" (null) from "failed to load" (thrown error)
    throw error;
  }
};

/**
 * Search transcripts
 * @param query - Search query string
 * @returns Promise with array of matching conferences
 */
export const searchTranscripts = async (query: string): Promise<Conference[]> => {
  try {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return [];
    }

    const encodedQuery = encodeURIComponent(trimmedQuery);
    const conferences = await api.get<Conference[]>(`${config.endpoints.search}?q=${encodedQuery}`);
    return conferences;
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API Error searching transcripts:', error.message);
    } else {
      console.error('Unexpected error searching transcripts:', error);
    }
    return [];
  }
};

/**
 * Check backend health status
 * @returns Promise with boolean indicating if backend is healthy
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await api.get(config.endpoints.health);
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

/**
 * Extract all talks from conferences into a flat array
 * @param conferences - Array of conferences
 * @returns Flat array of talks
 */
export const flattenTalks = (conferences: Conference[]): Talk[] => {
  return conferences.flatMap((conf) =>
    conf.talks.map((talk) => ({
      ...talk,
      _conferenceName: conf.name,
      _conferenceLocation: conf.location,
      _conferenceYear: conf.year,
    }))
  ) as (Talk & { _conferenceName: string; _conferenceLocation: string; _conferenceYear: number })[];
};

export default {
  getConferences,
  getAllTranscripts,
  getTranscriptById,
  searchTranscripts,
  checkBackendHealth,
  flattenTalks,
};