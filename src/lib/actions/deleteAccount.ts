'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const email = user.email
  if (!email) return { error: 'メールアドレスが取得できません' }

  try {
    const admin = createAdminClient()

    // 1. 退会済みメールアドレスを記録（再登録防止）
    const { error: bannedError } = await admin
      .from('deleted_accounts')
      .upsert({ email, deleted_at: new Date().toISOString() }, { onConflict: 'email' })
    if (bannedError) return { error: '退会処理に失敗しました' }

    // 2. usersテーブルにソフトデリート
    await admin
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id)

    // 3. サインアウト
    await supabase.auth.signOut()

  } catch {
    return { error: '退会処理に失敗しました' }
  }

  redirect('/login?deleted=1')
}

export async function checkDeletedEmail(email: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('deleted_accounts')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  return !!data
}
