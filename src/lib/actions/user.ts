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

  // liked: true を付与してPostCardがいいね済み状態で表示できるようにする
  return data?.map(l => l.posts ? { ...l.posts, liked: true } : null).filter(Boolean) ?? []
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
