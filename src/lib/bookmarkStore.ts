/**
 * Storage abstraction layer for Bookmark & Highlights
 * Supports localStorage, in-memory, and future cloud implementations
 */

import { LibraryState, DEFAULT_LIBRARY } from '@/types/bookmarks'
import { migrateLibrary } from './migrateLibrary'
import { toast } from 'sonner'

export const STORAGE_KEY = 'btc-library'

/**
 * Storage interface - all implementations must follow this contract
 * Components and hooks ONLY interact through this interface
 */
export interface BookmarkStore {
  load(): LibraryState
  save(state: LibraryState): LibraryState
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  try {
    const key = '__btc_test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * LocalBookmarkStore - persists to browser localStorage
 * Handles quota exceeded by pruning oldest 20% of highlights
 */
class LocalBookmarkStore implements BookmarkStore {
  load(): LibraryState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { ...DEFAULT_LIBRARY }

      const parsed = JSON.parse(raw)
      return migrateLibrary(parsed)
    } catch (error) {
      // Corrupted JSON in localStorage - wipe and start fresh
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore removal errors
      }
      return { ...DEFAULT_LIBRARY }
    }
  }

  save(state: LibraryState): LibraryState {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      return state
    } catch (error) {
      // Check if this is a quota exceeded error
      if (
        error instanceof DOMException &&
        (error.code === 22 ||
          error.code === 1014 ||
          error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        // Prune oldest 20% of highlights sorted by savedAt ascending
        const highlightsToPrune = Math.ceil(state.highlights.length * 0.2)
        if (highlightsToPrune > 0) {
          const sortedByAge = [...state.highlights].sort(
            (a, b) => a.savedAt - b.savedAt
          )
          const prunedHighlights = state.highlights.filter(
            (h) => !sortedByAge.slice(0, highlightsToPrune).includes(h)
          )

          const updatedState = {
            ...state,
            highlights: prunedHighlights,
          }

          // Retry once
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState))
            return updatedState
          } catch {
            // Still failing after pruning
            toast.warning('Storage full — some old highlights were removed')
            return updatedState
          }
        }

        toast.warning('Storage full — some old highlights were removed')
        return state
      }

      // Other errors - log but don't crash
      console.error('Failed to save bookmarks:', error)
      return state
    }
  }
}

/**
 * InMemoryStore - stores data only in RAM, loses on page refresh
 * Used as fallback when localStorage is unavailable (private/incognito mode)
 */
class InMemoryStore implements BookmarkStore {
  private state: LibraryState = { ...DEFAULT_LIBRARY }

  load(): LibraryState {
    return this.state
  }

  save(state: LibraryState): LibraryState {
    this.state = state
    return this.state
  }
}

/**
 * SupabaseBookmarkStore - stub for future cloud implementation
 * Will sync bookmarks to user account when backend auth is added
 */
class SupabaseBookmarkStore implements BookmarkStore {
  load(): LibraryState {
    throw new Error('SupabaseBookmarkStore: not yet implemented')
  }

  save(): LibraryState {
    throw new Error('SupabaseBookmarkStore: not yet implemented')
  }
}

const hasPersistentStorage = isLocalStorageAvailable()

/**
 * Active store instance - chosen at runtime based on localStorage availability
 * Components import and use this singleton, never the classes directly
 */
export const bookmarkStore: BookmarkStore = hasPersistentStorage
  ? new LocalBookmarkStore()
  : new InMemoryStore()

export const isBookmarkStorePersistent = hasPersistentStorage
