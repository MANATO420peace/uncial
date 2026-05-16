'use server'

import { createClient } from '@/lib/supabase/server'

const BADGE_THRESHOLDS = [
  { id: 'newcomer', label: '新入生', points: 0 },
  { id: 'active', label: 'アクティブ', points: 50 },
  { id: 'contributor', label: '貢献者', points: 200 },
  { id: 'expert', label: 'エキスパート', points: 500 },
  { id: 'legend', label: 'レジェンド', points: 1000 },
]

export function getBadgeForPoints(points: number) {
  return [...BADGE_THRESHOLDS].reverse().find(b => points >= b.points) ?? BADGE_THRESHOLDS[0]
}

export async function getMyPoints() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { points: 0, badge: BADGE_THRESHOLDS[0] }

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

export async function awardPoints(userId: string, amount: number) {
  const supabase = await createClient()
  await supabase.rpc('increment_points', { user_id: userId, amount })
}
