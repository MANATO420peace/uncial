'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushToUser } from './push'

export async function runNotificationDiagnostics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未ログイン', steps: [] }

  const steps: { label: string; ok: boolean; detail: string }[] = []

  // 1. adminClient
  let admin: ReturnType<typeof createAdminClient> | typeof supabase
  let usingAdmin = false
  try {
    admin = createAdminClient()
    usingAdmin = true
    steps.push({ label: 'AdminClient (SUPABASE_SERVICE_ROLE_KEY)', ok: true, detail: 'キー有効' })
  } catch (e) {
    admin = supabase
    steps.push({ label: 'AdminClient (SUPABASE_SERVICE_ROLE_KEY)', ok: false, detail: 'キー未設定 → 通常クライアントで代替' })
  }

  // 2. notifications テーブルが存在するか
  const { error: tableErr } = await admin.from('notifications').select('id').limit(1)
  if (tableErr) {
    steps.push({ label: 'notificationsテーブル', ok: false, detail: tableErr.message })
  } else {
    steps.push({ label: 'notificationsテーブル', ok: true, detail: '存在する' })
  }

  // 3. テスト通知をDBに書き込む（自分への通知）
  const { error: insertErr } = await admin.from('notifications').insert({
    user_id: user.id,
    actor_id: user.id,
    type: 'like',
    post_id: null,
    comment_id: null,
  })
  if (insertErr) {
    steps.push({ label: '通知INSERT', ok: false, detail: insertErr.message + (usingAdmin ? '' : ' ※ INSERT policyが必要') })
  } else {
    steps.push({ label: '通知INSERT', ok: true, detail: 'DBへの書き込み成功' })
  }

  // 4. 通知を読み取れるか
  const { data: notifs, error: readErr } = await admin
    .from('notifications').select('id').eq('user_id', user.id).limit(5)
  if (readErr) {
    steps.push({ label: '通知SELECT', ok: false, detail: readErr.message })
  } else {
    steps.push({ label: '通知SELECT', ok: true, detail: `${notifs?.length ?? 0}件取得` })
  }

  // 5. push_subscriptions テーブル
  const { data: subs, error: subErr } = await admin
    .from('push_subscriptions').select('endpoint').eq('user_id', user.id)
  if (subErr) {
    steps.push({ label: 'push_subscriptionsテーブル', ok: false, detail: subErr.message })
  } else if (!subs || subs.length === 0) {
    steps.push({ label: 'push_subscriptionsテーブル', ok: false, detail: 'テーブルはあるがこのユーザーの登録なし → 設定でプッシュ通知を有効化して' })
  } else {
    steps.push({ label: 'push_subscriptionsテーブル', ok: true, detail: `${subs.length}件の端末が登録済み` })
  }

  // 6. VAPID キー
  const vapidOk = !!(process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
  steps.push({
    label: 'VAPIDキー',
    ok: vapidOk,
    detail: vapidOk ? '3つとも設定済み' : '未設定のキーあり → Vercelで確認'
  })

  // 7. 実際にプッシュ送信を試みる
  if (subs && subs.length > 0 && vapidOk) {
    try {
      await sendPushToUser(user.id, '🔔 テスト通知', 'この通知が届いたら成功です！', '/notifications')
      steps.push({ label: 'プッシュ送信', ok: true, detail: '送信試行完了（端末で受信を確認）' })
    } catch (e) {
      steps.push({ label: 'プッシュ送信', ok: false, detail: String(e) })
    }
  } else {
    steps.push({ label: 'プッシュ送信', ok: false, detail: 'サブスクリプションかVAPIDキーが未準備' })
  }

  return { steps, userId: user.id }
}
