'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // adminクライアント優先（RLS無視で他ユーザーへの通知を書き込む）
  // 失敗した場合は通常クライアントで試みる（Supabaseに INSERT ポリシーが必要）
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  let usingAdmin = false
  try {
    db = createAdminClient()
    usingAdmin = true
  } catch {
    console.warn('[createNotification] admin client unavailable, falling back to regular client')
    db = await createClient()
  }

  const { error } = await db.from('notifications').insert({
    user_id: userId,
    actor_id: actorId,
    type,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
  })

  if (error) {
    console.error('[createNotification] insert error (usingAdmin=' + usingAdmin + '):', error.message)
    return
  }

  console.log('[createNotification] created:', type, 'for user:', userId)

  // アクター名を取得してプッシュ通知を送信
  const { data: actor } = await db.from('users').select('nickname').eq('id', actorId).single()
  const msg = PUSH_MESSAGES[type]
  if (msg && actor) {
    await sendPushToUser(userId, msg.title, msg.body(actor.nickname), '/notifications')
  }
}

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [], unreadCount: 0 }

  // adminクライアントでRLSを回避（SELECT ポリシー未設定環境でも動作させるため）
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try {
    db = createAdminClient()
  } catch {
    db = supabase
  }

  const { data, error } = await db
    .from('notifications')
    .select(`
      id, type, read_at, created_at,
      actor:users!actor_id(id, nickname),
      post:posts(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[getNotifications] error:', error.message)
    return { notifications: [], unreadCount: 0 }
  }

  const unreadCount = (data ?? []).filter(n => !n.read_at).length
  return { notifications: data ?? [], unreadCount }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // adminクライアントでRLSを回避
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try {
    db = createAdminClient()
  } catch {
    db = supabase
  }

  await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
}
