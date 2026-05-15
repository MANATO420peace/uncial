'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (user.id === targetUserId) return { error: '自分はフォローできません' }

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
    revalidatePath(`/user/${targetUserId}`)
    return { following: false }
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
    await createNotification({ userId: targetUserId, actorId: user.id, type: 'follow' })
    revalidatePath(`/user/${targetUserId}`)
    return { following: true }
  }
}

export async function getFollowStats(userId: string) {
  const supabase = await createClient()

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  if (user && user.id !== userId) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle()
    isFollowing = !!data
  }

  return { followersCount: followersCount ?? 0, followingCount: followingCount ?? 0, isFollowing }
}

export async function getFollowingPosts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { posts: [] }

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (!follows || follows.length === 0) return { posts: [] }

  const followingIds = follows.map(f => f.following_id)

  const { data } = await supabase
    .from('posts')
    .select('*, users(id, nickname), universities(id, name)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(30)

  return { posts: data ?? [] }
}
