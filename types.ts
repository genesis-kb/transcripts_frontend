/**
 * Shared TypeScript type definitions
 * Maps to the backend API response shapes
 */

/**
 * A single talk within a conference (from backend /api/v1/transcripts/conferences)
 */
export interface Talk {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  date: string;
  transcript: string;
  summary: string | null;
  tags: string[];
  transcriptBy: string;
}

/**
 * Conference grouping of talks (from backend /api/v1/transcripts/conferences)
 */
export interface Conference {
  id: string;
  name: string;
  location: string;
  year: number;
  talks: Talk[];
}

/**
 * Raw transcript row from the database (from backend /api/v1/transcripts/:id)
 */
export interface RawTranscript {
  id: string;
  title: string;
  speakers: string[] | string;
  event_date: string;
  loc: string;
  raw_text: string;
  corrected_text: string | null;
  summary: string | null;
  tags: string[];
  categories: string[];
}

/**
 * Entity extraction result (from backend /api/v1/ai/entities)
 */
export interface Entities {
  speakers: string[];
  topics: string[];
  technicalConcepts: string[];
  organizations: string[];
  keyQuotes: string[];
  sentiment: string;
}

