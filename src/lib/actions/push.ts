'use server'

import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function initVapid() {
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!subject || !publicKey || !privateKey) {
    console.warn('[initVapid] VAPID keys missing:', { subject: !!subject, publicKey: !!publicKey, privateKey: !!privateKey })
    return false
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

export async function subscribeToPush(subscription: PushSubscriptionJSON) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { endpoint, keys } = subscription as { endpoint: string; keys: { p256dh: string; auth: string } }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  }, { onConflict: 'endpoint' })

  if (error) {
    console.error('[subscribeToPush] upsert error:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

export async function unsubscribeFromPush(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)
}

export async function sendPushToUser(userId: string, title: string, body: string, url = '/notifications') {
  if (!initVapid()) return

  // adminクライアントで他ユーザーのpush_subscriptionsを読む
  // 通常クライアントだとRLSで「自分のサブスクリプションしか読めない」ためブロックされる
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try {
    db = createAdminClient()
  } catch {
    console.warn('[sendPushToUser] admin client unavailable, falling back to regular client')
    db = await createClient()
  }

  const { data: subs, error } = await db
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error) {
    console.error('[sendPushToUser] fetch subscriptions error:', error.message)
    return
  }

  if (!subs || subs.length === 0) {
    console.log('[sendPushToUser] no subscriptions for user:', userId)
    return
  }

  const payload = JSON.stringify({ title, body, url })

  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      ).then(() => {
        console.log('[sendPushToUser] push sent to:', sub.endpoint.slice(0, 40))
      }).catch(async (err) => {
        console.error('[sendPushToUser] push error:', err.statusCode, err.body)
        if (err.statusCode === 410) {
          // 期限切れのサブスクリプションを削除
          const supabase = await createClient()
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      })
    )
  )
}
