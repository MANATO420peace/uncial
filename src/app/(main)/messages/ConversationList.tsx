'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'

interface Conversation {
  id: string
  last_message_at: string
  unread_count: number
  user1: { id: string; nickname: string; avatar_url?: string | null } | null
  user2: { id: string; nickname: string; avatar_url?: string | null } | null
}

interface Props {
  conversations: Conversation[]
  currentUserId: string
}

export function ConversationList({ conversations, currentUserId }: Props) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('messages-list-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as { sender_id: string; conversation_id: string }
          // 自分以外が送ったメッセージのみ更新
          if (msg.sender_id !== currentUserId) {
            router.refresh()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => { router.refresh() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, router])

  return (
    <ul>
      {conversations.map((conv) => {
        const other = conv.user1?.id === currentUserId ? conv.user2 : conv.user1
        const otherNickname = other?.nickname ?? '不明なユーザー'
        const hasUnread = conv.unread_count > 0
        return (
          <li key={conv.id}>
            <Link
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 px-4 py-4 border-b hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={other?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {otherNickname[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                    {otherNickname}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                {hasUnread && (
                  <p className="text-xs text-primary font-medium mt-0.5">
                    未読 {conv.unread_count}件
                  </p>
                )}
              </div>
              {hasUnread && (
                <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                  {conv.unread_count > 99 ? '99+' : conv.unread_count}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
