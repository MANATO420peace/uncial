'use client'

import { useState, useEffect, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleLike } from '@/lib/actions/posts'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  postId: string
  initialLiked: boolean
  initialCount: number
  currentUserId?: string
}

export function LikeButton({ postId, initialLiked, initialCount, currentUserId }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  // Supabaseリアルタイムで他端末のいいね変化を受信
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`likes:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT / DELETE どちらも
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // 自分の操作は楽観的更新で既に反映済みなのでスキップ
          const changedUserId =
            payload.eventType === 'INSERT'
              ? (payload.new as { user_id: string }).user_id
              : (payload.old as { user_id: string }).user_id
          if (changedUserId === currentUserId) return

          if (payload.eventType === 'INSERT') {
            setCount(c => c + 1)
          } else if (payload.eventType === 'DELETE') {
            setCount(c => Math.max(0, c - 1))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId, currentUserId])

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
