/**
 * Reusable Bookmark Button Component
 * Used in both TranscriptCard and TranscriptDetail
 * Handles toggle state and prevents event propagation from cards
 */

import { useBookmarks } from '@/hooks/useBookmarks'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  transcript: {
    id: string
    title: string
    speakers: string | string[]
    event_date: string
    loc?: string
  }
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function BookmarkButton({
  transcript,
  size = 'md',
  showLabel = false,
}: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks()
  const bookmarked = isBookmarked(transcript.id)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent card click from firing when button is clicked
    e.stopPropagation()

    if (bookmarked) {
      removeBookmark(transcript.id)
    } else {
      addBookmark(transcript)
    }
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const buttonSize =
    size === 'sm'
      ? 'p-1.5 hover:bg-secondary/80'
      : 'px-3 py-2 hover:bg-secondary'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md transition-colors',
        'text-foreground hover:text-primary',
        buttonSize
      )}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark
        className={cn(iconSize, bookmarked && 'fill-current')}
        strokeWidth={bookmarked ? 1.5 : 2}
      />
      {showLabel && <span className={cn(textSize, 'font-medium')}>
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>}
    </button>
  )
}
