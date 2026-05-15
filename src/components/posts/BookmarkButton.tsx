'use client'

import { useState, useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { toggleBookmark } from '@/lib/actions/bookmarks'

interface Props {
  postId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ postId, initialBookmarked }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    startTransition(async () => {
      const result = await toggleBookmark(postId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      if (result?.bookmarked !== undefined) setBookmarked(result.bookmarked)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1 text-[11px] transition-colors',
        bookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Bookmark className={cn('h-3 w-3', bookmarked && 'fill-yellow-500')} />
    </button>
  )
}
