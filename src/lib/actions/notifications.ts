'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from './push'

const PUSH_MESSAGES: Record<string, { title: string; body: (actor: string) => string }> = {
  like: { title: 'いいね', body: (a) => `${a}さんがあなたの投稿にいいねしました` },
  comment: { title: 'コメント', body: (a) => `${a}さんがコメントしました` },
  follow: { title: 'フォロー', body: (a) => `${a}さんにフォローされました` },
  follow_request: { title: 'フォローリクエスト', body: (a) => `${a}さんからフォローリクエストが届きました` },
}

export async function createNotification({
  userId,
  actorId,
  type,
  postId,
  commentId,
}: {
  userId: string
  actorId: string
  type: 'like' | 'comment' | 'follow' | 'follow_request'
  postId?: string
  commentId?: string
}) {
  if (userId === actorId) return
  const supabase = await createClient()

  await supabase.from('notifications').insert({
    user_id: userId,
    actor_id: actorId,
    type,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
  })

  // プッシュ通知を送信
  const { data: actor } = await supabase.from('users').select('nickname').eq('id', actorId).single()
  const msg = PUSH_MESSAGES[type]
  if (msg && actor) {
    await sendPushToUser(userId, msg.title, msg.body(actor.nickname), '/notifications')
  }
}

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [], unreadCount: 0 }

  const { data } = await supabase
    .from('notifications')
    .select(`
      id, type, read_at, created_at,
      actor:users!actor_id(id, nickname),
      post:posts(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = (data ?? []).filter(n => !n.read_at).length
  return { notifications: data ?? [], unreadCount }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
}
