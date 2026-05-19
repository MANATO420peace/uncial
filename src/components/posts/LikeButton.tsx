'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleLike } from '@/lib/actions/posts'
import { toast } from 'sonner'

interface Props {
  postId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    // 楽観的更新：即時反映
    const newLiked = !liked
    setLiked(newLiked)
    setCount(c => Math.max(0, c + (newLiked ? 1 : -1)))

    startTransition(async () => {
      const result = await toggleLike(postId)
      if (result?.error) {
        toast.error(result.error)
        // 失敗時ロールバック
        setLiked(!newLiked)
        setCount(c => Math.max(0, c + (newLiked ? -1 : 1)))
        return
      }
      // サーバーの正確な値で同期
      if (result && 'liked' in result) setLiked(result.liked)
      if (result && 'likesCount' in result && result.likesCount != null) {
        setCount(result.likesCount)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        liked
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-rose-500 text-rose-500')} />
      <span>{count}</span>
    </button>
  )
}
