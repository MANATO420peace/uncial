'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBadgeForPoints } from '@/lib/badges'

export async function getMyPoints() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { points: 0, badge: getBadgeForPoints(0) }

  const { data } = await supabase
    .from('users')
    .select('points')
    .eq('id', user.id)
    .single()

  const points = (data as { points?: number } | null)?.points ?? 0
  return { points, badge: getBadgeForPoints(points) }
}

export async function getUserPoints(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('points')
    .eq('id', userId)
    .single()

  const points = (data as { points?: number } | null)?.points ?? 0
  return { points, badge: getBadgeForPoints(points) }
}

export async function awardPoints(userId: string, amount: number, reason?: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_points', { user_id: userId, amount })

  // ポイント履歴を記録
  if (reason) {
    let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
    try { db = createAdminClient() } catch { db = supabase }
    // エラーは無視（point_logsテーブルが未作成でも動作する）
    await db.from('point_logs').insert({ user_id: userId, amount, reason }).then(() => {}).catch(() => {})
  }
}

export async function getPointLogs(limit = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('point_logs')
    .select('id, amount, reason, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getTopUsers(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('id, nickname, points, avatar_url, universities(name)')
    .order('points', { ascending: false })
    .limit(limit)

  return (data ?? []) as {
    id: string
    nickname: string
    points: number | null
    avatar_url: string | null
    universities: { name: string } | null
  }[]
}
