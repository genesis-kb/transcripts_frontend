/**
 * Floating toolbar for selecting and saving text highlights
 * Appears when user selects 10+ characters inside the transcript reader
 * Handles both desktop and mobile interactions
 */

import { useEffect, useRef, useState } from 'react'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Copy, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HighlightToolbarProps {
  containerRef: React.RefObject<HTMLDivElement>
  transcriptId: string
  transcriptTitle: string
}

export function HighlightToolbar({
  containerRef,
  transcriptId,
  transcriptTitle,
}: HighlightToolbarProps) {
  const { addHighlight } = useBookmarks()

  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const isSavingRef = useRef(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toolbarRef.current) return

    toolbarRef.current.style.top = `${toolbarPosition.top}px`
    toolbarRef.current.style.left = `${toolbarPosition.left}px`
  }, [toolbarPosition])

  /**
   * Handle text selection - show toolbar
   */
  useEffect(() => {
    const handleSelection = (event: MouseEvent | TouchEvent) => {
      if (
        toolbarRef.current &&
        event.target instanceof Node &&
        toolbarRef.current.contains(event.target)
      ) {
        return
      }

      const selection = window.getSelection()
      if (!selection) return

      const selectedStr = selection.toString().trim()

      // Require at least 10 characters
      if (selectedStr.length < 10) {
        setToolbarVisible(false)
        return
      }

      try {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        if (rect.width === 0 && rect.height === 0) {
          setToolbarVisible(false)
          return
        }

        // Position toolbar above selection with scroll offset
        let top = rect.top + window.scrollY - 50
        let left = rect.left + window.scrollX + rect.width / 2 - 120

        // Clamp to container bounds
        const container = containerRef.current
        if (container) {
          const containerRect = container.getBoundingClientRect()
          const containerTop = containerRect.top + window.scrollY
          const containerLeft = containerRect.left + window.scrollX
          const relativeTop = top - containerTop
          const relativeLeft = left - containerLeft
          const maxLeft = Math.max(0, container.clientWidth - 240)

          top = Math.max(0, relativeTop)
          left = Math.max(0, Math.min(relativeLeft, maxLeft))
        }

        setToolbarPosition({ top: Math.max(0, top), left: Math.max(0, left) })
        setSelectedText(selectedStr)
        setShowNoteInput(false)
        setNoteValue('')
        setToolbarVisible(true)
      } catch {
        setToolbarVisible(false)
      }
    }

    const container = containerRef.current
    if (!container) return

    container.addEventListener('mouseup', handleSelection)
    container.addEventListener('touchend', handleSelection)

    return () => {
      container.removeEventListener('mouseup', handleSelection)
      container.removeEventListener('touchend', handleSelection)
    }
  }, [containerRef])

  /**
   * Handle clicking outside toolbar to dismiss
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setToolbarVisible(false)
      }
    }

    if (toolbarVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [toolbarVisible])

  /**
   * Save highlight with optional note
   */
  const handleSaveHighlight = () => {
    if (isSavingRef.current) return

    isSavingRef.current = true

    try {
      addHighlight(
        transcriptId,
        transcriptTitle,
        selectedText,
        noteValue.trim() || undefined
      )

      // Reset state
      setToolbarVisible(false)
      setShowNoteInput(false)
      setNoteValue('')
      setSelectedText('')
    } finally {
      isSavingRef.current = false
    }
  }

  const handleCopySelectedText = async () => {
    if (!selectedText.trim()) return

    try {
      await navigator.clipboard.writeText(selectedText)
      toast.success('Copied selection')
    } catch {
      toast.error('Could not copy selection')
    }
  }

  if (!toolbarVisible) return null

  return (
    <div
      ref={toolbarRef}
      className="absolute bg-card border border-border rounded-lg shadow-lg p-3 z-50 max-w-80"
    >
      {!showNoteInput ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNoteInput(true)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'px-3 py-2 rounded bg-primary text-primary-foreground',
              'text-sm font-medium hover:bg-primary/90',
              'transition-colors',
              isSavingRef.current && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isSavingRef.current}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleCopySelectedText}
            className={cn(
              'inline-flex items-center justify-center gap-1',
              'px-3 py-2 rounded border border-border',
              'text-sm font-medium hover:bg-secondary',
              'transition-colors'
            )}
            aria-label="Copy selected text"
            title="Copy selected text"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setToolbarVisible(false)}
            className="p-2 hover:bg-secondary rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="Add a note (optional)..."
            className={cn(
              'w-full px-2 py-1.5 rounded border border-border',
              'bg-background text-foreground placeholder-muted-foreground',
              'text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary',
              'max-h-24'
            )}
            rows={3}
            spellCheck={true}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveHighlight}
              className={cn(
                'flex-1 px-2 py-1.5 rounded bg-primary text-primary-foreground',
                'text-xs font-medium hover:bg-primary/90',
                'transition-colors',
                isSavingRef.current && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isSavingRef.current}
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowNoteInput(false)
                setNoteValue('')
              }}
              className={cn(
                'flex-1 px-2 py-1.5 rounded border border-border',
                'text-xs font-medium hover:bg-secondary',
                'transition-colors',
                isSavingRef.current && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isSavingRef.current}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
