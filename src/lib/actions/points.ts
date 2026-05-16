'use server'

import { createClient } from '@/lib/supabase/server'
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

export async function awardPoints(userId: string, amount: number) {
  const supabase = await createClient()
  await supabase.rpc('increment_points', { user_id: userId, amount })
}
