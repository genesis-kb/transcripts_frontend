import { useQuery } from '@tanstack/react-query';
import {
  getConferenceSummary,
  getTranscriptMeta,
  getTranscriptById,
  searchTranscripts,
} from '../../services/dataService';
import type { Conference, RawTranscript, SearchResult, PaginatedResponse } from '../../types';

export const QUERY_KEYS = {
  conferences: ['conferences', 'summary'] as const,
  meta: ['transcripts', 'meta'] as const,
  transcript: (id: string) => ['transcript', id] as const,
  search: (query: string) => ['search', query] as const,
} as const;

export const useConferences = (enabled = true) =>
  useQuery<Conference[]>({
    queryKey: QUERY_KEYS.conferences,
    queryFn: getConferenceSummary,
    enabled,
  });

export const useMeta = (enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.meta,
    queryFn: getTranscriptMeta,
    enabled,
  });

export const useTranscript = (id: string | undefined, enabled = true) =>
  useQuery<RawTranscript | null>({
    queryKey: QUERY_KEYS.transcript(id || ''),
    queryFn: () => getTranscriptById(id || ''),
    enabled: enabled && Boolean(id),
    staleTime: 10 * 60 * 1000,
  });

export const useSearch = (query: string, enabled = true) =>
  useQuery<PaginatedResponse<SearchResult>>({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => searchTranscripts(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 60 * 1000,
  });

export default {
  useConferences,
  useMeta,
  useTranscript,
  useSearch,
};