/**
 * Reconciliation hook - cross-references saved bookmarks against React Query cache
 * Marks deleted transcripts and silently refreshes stale snapshot fields
 * Zero network calls - uses existing cache
 */

import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Highlight } from '@/types/bookmarks'

/**
 * Represents a transcript from the React Query cache
 */
interface Transcript {
  id: string
  title: string
  speakers: string | string[]
  event_date: string
  [key: string]: unknown
}

export interface UseBookmarkReconciliationReturn {
  reconciledBookmarks: Bookmark[]
  reconciledHighlights: Highlight[]
  isLoading: boolean
  deletedBookmarkCount: number
}

export function useBookmarkReconciliation(
  bookmarks: Bookmark[],
  highlights: Highlight[]
): UseBookmarkReconciliationReturn {
  const queryClient = useQueryClient()

  // Read from React Query with the same key while keeping this hook cache-only.
  // This never calls the backend directly; it only returns whatever is already cached.
  const { data: allTranscripts, isLoading } = useQuery<Transcript[] | undefined>({
    queryKey: ['transcripts'],
    queryFn: async () => queryClient.getQueryData<Transcript[]>(['transcripts']),
    staleTime: Infinity,
    retry: false,
  })

  /**
   * Reconcile bookmarks: flag deleted items, refresh stale snapshot fields
   */
  const reconciledBookmarks = useMemo(() => {
    // Cache not loaded yet — return bookmarks as-is, no flicker
    if (!allTranscripts) return bookmarks

    const liveMap = new Map(allTranscripts.map((t) => [t.id, t]))

    return bookmarks.map((b) => {
      const live = liveMap.get(b.id)

      if (!live) {
        // Transcript was deleted from the database
        return { ...b, deleted: true }
      }

      // Silently refresh stale snapshot fields from live cache
      return {
        ...b,
        deleted: false,
        title: live.title ?? b.title,
        speakers:
          (Array.isArray(live.speakers)
            ? live.speakers.join(', ')
            : live.speakers) ?? b.speakers,
        event_date: live.event_date ?? b.event_date,
      }
    })
  }, [bookmarks, allTranscripts])

  /**
   * Reconcile highlights: flag deleted source transcripts
   */
  const reconciledHighlights = useMemo(() => {
    if (!allTranscripts) return highlights

    const liveIds = new Set(allTranscripts.map((t) => t.id))

    return highlights.map((h) => ({
      ...h,
      deleted: !liveIds.has(h.transcriptId),
    }))
  }, [highlights, allTranscripts])

  const deletedBookmarkCount = reconciledBookmarks.filter(
    (b) => b.deleted
  ).length

  return {
    reconciledBookmarks,
    reconciledHighlights,
    isLoading,
    deletedBookmarkCount,
  }
}
