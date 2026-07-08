'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface PostNotificationStatus {
  exists: boolean
  notify_posts: boolean
  notify_buy_sell: boolean
}

/** 自分が特定ユーザーの通知設定を取得 */
export async function getPostNotificationStatus(targetUserId: string): Promise<PostNotificationStatus> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { exists: false, notify_posts: false, notify_buy_sell: false }

  const { data } = await supabase
    .from('post_notifications')
    .select('id, notify_posts, notify_buy_sell')
    .eq('user_id', user.id)
    .eq('target_user_id', targetUserId)
    .maybeSingle()

  if (!data) return { exists: false, notify_posts: false, notify_buy_sell: false }
  return { exists: true, notify_posts: data.notify_posts, notify_buy_sell: data.notify_buy_sell }
}

/** 通知設定を更新（notify_posts / notify_buy_sell） */
export async function updatePostNotification(
  targetUserId: string,
  notify_posts: boolean,
  notify_buy_sell: boolean,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (user.id === targetUserId) return { error: '自分自身には設定できません' }

  const bothOff = !notify_posts && !notify_buy_sell

  if (bothOff) {
    // 両方OFFなら行を削除
    await supabase
      .from('post_notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('target_user_id', targetUserId)
  } else {
    // upsert
    await supabase
      .from('post_notifications')
      .upsert(
        { user_id: user.id, target_user_id: targetUserId, notify_posts, notify_buy_sell },
        { onConflict: 'user_id,target_user_id' }
      )
  }

  return { error: null, notify_posts, notify_buy_sell }
}

/** 投稿作成時: 通知をONにしているユーザーへ通知を送る */
export async function notifyPostFollowers(
  postUserId: string,
  postId: string,
  postTitle: string,
  isBuySell = false,
) {
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = await createClient() }

  const column = isBuySell ? 'notify_buy_sell' : 'notify_posts'

  const { data: subscribers } = await db
    .from('post_notifications')
    .select('user_id')
    .eq('target_user_id', postUserId)
    .eq(column, true)

  if (!subscribers || subscribers.length === 0) return

  const { data: poster } = await db
    .from('users')
    .select('nickname')
    .eq('id', postUserId)
    .single()

  const nickname = poster?.nickname ?? 'ユーザー'

  const notifications = subscribers.map(s => ({
    user_id: s.user_id,
    actor_id: postUserId,
    type: 'new_post' as const,
    post_id: postId,
  }))

  await db.from('notifications').insert(notifications)

  const { sendPushToUser } = await import('./push')
  const message = isBuySell
    ? `${nickname}さんが出品しました: ${postTitle}`
    : `${nickname}さんが投稿しました: ${postTitle}`

  await Promise.all(
    subscribers.map(s =>
      sendPushToUser(s.user_id, isBuySell ? '新しい出品' : '新しい投稿', message, `/post/${postId}`)
    )
  )
}
