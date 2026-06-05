'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getLikedPosts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('likes')
    .select('posts(*, users(id, nickname), universities(id, name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const posts = data?.map(l => l.posts).filter(Boolean) ?? []
  if (posts.length === 0) return []

  // likesテーブルから正確なカウントを一括取得（likes_countキャッシュが0になる問題を回避）
  const postIds = posts.map(p => (p as { id: string }).id)
  const { data: allLikes } = await supabase
    .from('likes')
    .select('post_id')
    .in('post_id', postIds)

  const realCountMap = new Map<string, number>()
  allLikes?.forEach(l => {
    realCountMap.set(l.post_id, (realCountMap.get(l.post_id) ?? 0) + 1)
  })

  // liked: true を付与し、正確なlikes_countをセット
  return posts.map(p => {
    const post = p as { id: string; likes_count?: number }
    return { ...p, liked: true, likes_count: realCountMap.get(post.id) ?? post.likes_count ?? 0 }
  })
}

export async function getFollowList(userId: string, type: 'followers' | 'following') {
  const supabase = await createClient()

  if (type === 'followers') {
    const { data } = await supabase
      .from('follows')
      .select('users!follower_id(id, nickname, avatar_url, universities(name))')
      .eq('following_id', userId)
    return data?.map(f => f.users).filter(Boolean) ?? []
  } else {
    const { data } = await supabase
      .from('follows')
      .select('users!following_id(id, nickname, avatar_url, universities(name))')
      .eq('follower_id', userId)
    return data?.map(f => f.users).filter(Boolean) ?? []
  }
}

export async function getUniversities() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('universities')
    .select('*')
    .order('name')
  return data ?? []
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*, universities(id, name)')
    .eq('id', user.id)
    .single()

  return data
}

export async function getSuggestedUsers(limit = 5) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('users')
    .select('university_id')
    .eq('id', user.id)
    .single()

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const excludeIds = new Set([user.id, ...(follows?.map(f => f.following_id) ?? [])])

  let query = supabase
    .from('users')
    .select('id, nickname, avatar_url, points, universities(name)')
    .order('points', { ascending: false })
    .limit(30)

  if (profile?.university_id) {
    query = query.eq('university_id', profile.university_id)
  }

  const { data } = await query
  return (data ?? []).filter(u => !excludeIds.has(u.id)).slice(0, limit)
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const avatarUrl = formData.get('avatar_url') as string | null
  const isPrivate = formData.get('is_private') === 'true'
  const bio = (formData.get('bio') as string) || null

  const { error } = await supabase
    .from('users')
    .update({
      nickname: formData.get('nickname') as string,
      university_id: (formData.get('university_id') as string) || null,
      faculty: (formData.get('faculty') as string) || null,
      grade: (formData.get('grade') as string) || null,
      is_private: isPrivate,
      bio,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/settings')
  return { error: null }
}
