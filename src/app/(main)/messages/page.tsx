import { Metadata } from 'next'
import Link from 'next/link'
import { getConversations } from '@/lib/actions/messages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'メッセージ' }

export default async function MessagesPage() {
  const { conversations, currentUserId } = await getConversations()

  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-lg">メッセージ</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <MessageCircle className="h-12 w-12 opacity-30" />
          <p className="text-sm">まだメッセージがありません</p>
          <p className="text-xs">ユーザープロフィールからDMを送ることができます</p>
        </div>
      ) : (
        <ul>
          {conversations.map((conv: {
            id: string
            last_message_at: string
            unread_count: number
            user1: { id: string; nickname: string } | null
            user2: { id: string; nickname: string } | null
          }) => {
            const other = conv.user1?.id === currentUserId ? conv.user2 : conv.user1
            if (!other) return null
            const hasUnread = conv.unread_count > 0
            return (
              <li key={conv.id}>
                <Link
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-4 border-b hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {other.nickname[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                        {other.nickname}
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
      )}
    </div>
  )
}
