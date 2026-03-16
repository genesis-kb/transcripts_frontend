/**
 * Schema migration logic for Bookmark & Highlights localStorage data
 * Handles graceful transformation of old data shapes to current schema version
 */

import { LibraryState, DEFAULT_LIBRARY } from '@/types/bookmarks'

function isV2LibraryState(value: unknown): value is LibraryState {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>

  return (
    data.version === 2 &&
    Array.isArray(data.bookmarks) &&
    Array.isArray(data.highlights)
  )
}

export function migrateLibrary(raw: unknown): LibraryState {
  // completely missing or wrong type — start fresh
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LIBRARY }

  const data = raw as Record<string, unknown>

  // v1 — no version field, no highlights array
  if (!data.version || data.version === 1) {
    return {
      ...DEFAULT_LIBRARY,
      bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
      highlights: [], // add missing field
      version: 2,
    }
  }

  // current version — use as-is when shape is valid
  if (isV2LibraryState(data)) return data

  // unknown future version loaded in older app — reset safely
  return { ...DEFAULT_LIBRARY }
}
