'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** 特定ユーザーの投稿通知をON/OFFトグル */
export async function togglePostNotification(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (user.id === targetUserId) return { error: '自分自身には設定できません' }

  const { data: existing } = await supabase
    .from('post_notifications')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_user_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_notifications').delete().eq('id', existing.id)
    return { enabled: false }
  } else {
    await supabase.from('post_notifications').insert({ user_id: user.id, target_user_id: targetUserId })
    return { enabled: true }
  }
}

/** 自分が特定ユーザーの投稿通知をONにしているか確認 */
export async function getPostNotificationStatus(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('post_notifications')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_user_id', targetUserId)
    .maybeSingle()

  return !!data
}

/** 投稿作成時: 通知をONにしているユーザーへ通知を送る */
export async function notifyPostFollowers(postUserId: string, postId: string, postTitle: string) {
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = await createClient() }

  // この投稿者の通知ONユーザーを取得
  const { data: subscribers } = await db
    .from('post_notifications')
    .select('user_id')
    .eq('target_user_id', postUserId)

  if (!subscribers || subscribers.length === 0) return

  // 投稿者のニックネームを取得
  const { data: poster } = await db
    .from('users')
    .select('nickname')
    .eq('id', postUserId)
    .single()

  const nickname = poster?.nickname ?? 'ユーザー'

  // 全購読者に通知を作成
  const notifications = subscribers.map(s => ({
    user_id: s.user_id,
    actor_id: postUserId,
    type: 'new_post' as const,
    post_id: postId,
  }))

  await db.from('notifications').insert(notifications)

  // プッシュ通知も送る
  const { sendPushToUser } = await import('./push')
  await Promise.all(
    subscribers.map(s =>
      sendPushToUser(
        s.user_id,
        '新しい投稿',
        `${nickname}さんが投稿しました: ${postTitle}`,
        `/post/${postId}`
      )
    )
  )
}
