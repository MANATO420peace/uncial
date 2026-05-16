'use server'

import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function subscribeToPush(subscription: PushSubscriptionJSON) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { endpoint, keys } = subscription as { endpoint: string; keys: { p256dh: string; auth: string } }

  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  }, { onConflict: 'endpoint' })

  return { error: null }
}

export async function unsubscribeFromPush(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)
}

export async function sendPushToUser(userId: string, title: string, body: string, url = '/notifications') {
  const supabase = await createClient()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  const payload = JSON.stringify({ title, body, url })

  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      ).catch(async (err) => {
        if (err.statusCode === 410) {
          // 期限切れのサブスクリプションを削除
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      })
    )
  )
}
