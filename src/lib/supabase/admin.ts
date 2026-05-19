import { createClient } from '@supabase/supabase-js'

/**
 * RLS を無視するサービスロールクライアント。
 * 通知の書き込みなど、他ユーザーへの操作が必要な場合のみ使用する。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY が設定されていません')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
