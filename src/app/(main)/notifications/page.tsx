import { Metadata } from 'next'
import Link from 'next/link'
import { Bell, Heart, MessageSquare, UserPlus } from 'lucide-react'
import { getNotifications, markAllNotificationsRead } from '@/lib/actions/notifications'
import { timeAgo } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata: Metadata = { title: '通知' }

const TYPE_ICON = {
  like: Heart,
  comment: MessageSquare,
  follow: UserPlus,
}

const TYPE_TEXT = {
  like: 'があなたの投稿にいいねしました',
  comment: 'があなたの投稿にコメントしました',
  follow: 'があなたをフォローしました',
}

export default async function NotificationsPage() {
  const { notifications } = await getNotifications()
  await markAllNotificationsRead()

  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-lg">通知</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Bell className="h-12 w-12 opacity-30" />
          <p className="text-sm">まだ通知がありません</p>
        </div>
      ) : (
        <ul>
          {notifications.map((n: any) => {
            const Icon = TYPE_ICON[n.type as keyof typeof TYPE_ICON] ?? Bell
            const text = TYPE_TEXT[n.type as keyof typeof TYPE_TEXT] ?? ''
            const actor = n.actor as { id: string; nickname: string } | null
            const href = n.type === 'follow' && actor
              ? `/user/${actor.id}`
              : n.post?.id
              ? `/post/${n.post.id}`
              : '#'

            return (
              <li key={n.id}>
                <Link
                  href={href}
                  className={`flex items-start gap-3 px-4 py-4 border-b transition-colors hover:bg-muted/50 ${!n.read_at ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs bg-muted">
                      {actor?.nickname?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{actor?.nickname}</span>
                      {text}
                    </p>
                    {n.post?.title && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">「{n.post.title}」</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <Icon className="h-4 w-4 shrink-0 mt-1 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
