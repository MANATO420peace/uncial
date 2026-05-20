import { Metadata } from 'next'
import Link from 'next/link'
import { Bell, Heart, MessageSquare, UserPlus } from 'lucide-react'
import { getNotifications, markAllNotificationsRead } from '@/lib/actions/notifications'
import { FollowRequestActions } from '@/components/notifications/FollowRequestActions'
import { timeAgo } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata: Metadata = { title: '通知' }

const TYPE_ICON = {
  like: Heart,
  comment: MessageSquare,
  follow: UserPlus,
  follow_request: UserPlus,
}

const TYPE_TEXT = {
  like: 'があなたの投稿にいいねしました',
  comment: 'があなたの投稿にコメントしました',
  follow: 'があなたをフォローしました',
  follow_request: 'からフォローリクエストが届きました',
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
          {notifications.map((n: never) => {
            const notif = n as {
              id: string
              type: keyof typeof TYPE_ICON
              read_at: string | null
              created_at: string
              actor: { id: string; nickname: string } | null
              post: { id: string; title: string } | null
            }
            const Icon = TYPE_ICON[notif.type] ?? Bell
            const text = TYPE_TEXT[notif.type] ?? ''
            const isFollowRequest = notif.type === 'follow_request'

            const href = (notif.type === 'follow' || notif.type === 'follow_request') && notif.actor
              ? `/user/${notif.actor.id}`
              : notif.post?.id
              ? `/post/${notif.post.id}`
              : '#'

            const innerContent = (
              <div className="flex items-start gap-3 w-full">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {notif.actor?.nickname?.[0]?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{notif.actor?.nickname}</span>
                    {text}
                  </p>
                  {notif.post?.title && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">「{notif.post.title}」</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                  {isFollowRequest && notif.actor && (
                    <FollowRequestActions requesterId={notif.actor.id} />
                  )}
                </div>
                <Icon className="h-4 w-4 shrink-0 mt-1 text-muted-foreground" />
              </div>
            )

            return (
              <li key={notif.id}>
                {isFollowRequest ? (
                  <div className={`flex items-start gap-3 px-4 py-4 border-b ${!notif.read_at ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                    {innerContent}
                  </div>
                ) : (
                  <Link
                    href={href}
                    className={`flex items-start gap-3 px-4 py-4 border-b transition-colors hover:bg-muted/50 ${!notif.read_at ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                  >
                    {innerContent}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
