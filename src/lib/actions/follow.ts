'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from './notifications'

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (user.id === targetUserId) return { error: '自分はフォローできません' }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return { error: 'サーバー設定エラー' }
  }

  // すでにフォロー中なら解除
  const { data: existing } = await admin
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await admin.from('follows').delete().eq('id', existing.id)
    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/profile')
    return { following: false, requested: false }
  }

  // リクエスト中なら取り消し
  const { data: existingRequest } = await admin
    .from('follow_requests')
    .select('id')
    .eq('requester_id', user.id)
    .eq('target_id', targetUserId)
    .maybeSingle()

  if (existingRequest) {
    await admin.from('follow_requests').delete().eq('id', existingRequest.id)
    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/profile')
    return { following: false, requested: false }
  }

  // 非公開アカウントならリクエスト
  const { data: targetProfile } = await admin
    .from('users')
    .select('is_private')
    .eq('id', targetUserId)
    .single()

  if (targetProfile?.is_private) {
    const { error: reqErr } = await admin
      .from('follow_requests')
      .insert({ requester_id: user.id, target_id: targetUserId })
    if (reqErr) {
      console.error('[toggleFollow] follow_request insert error:', reqErr.message)
      return { error: 'フォローリクエストに失敗しました' }
    }
    await createNotification({ userId: targetUserId, actorId: user.id, type: 'follow_request' })
    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/profile')
    return { following: false, requested: true }
  }

  // 通常フォロー
  const { error: followErr } = await admin
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetUserId })
  if (followErr) {
    console.error('[toggleFollow] follows insert error:', followErr.message)
    return { error: 'フォローに失敗しました' }
  }
  await createNotification({ userId: targetUserId, actorId: user.id, type: 'follow' })
  revalidatePath(`/user/${targetUserId}`)
  revalidatePath('/profile')
  return { following: true, requested: false }
}

export async function getFollowStats(userId: string) {
  const supabase = await createClient()

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  let hasPendingRequest = false

  if (user && user.id !== userId) {
    const [{ data: followData }, { data: requestData }] = await Promise.all([
      supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', userId).maybeSingle(),
      supabase.from('follow_requests').select('id').eq('requester_id', user.id).eq('target_id', userId).maybeSingle(),
    ])
    isFollowing = !!followData
    hasPendingRequest = !!requestData
  }

  return {
    followersCount: followersCount ?? 0,
    followingCount: followingCount ?? 0,
    isFollowing,
    hasPendingRequest,
  }
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

export async function getFollowRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('follow_requests')
    .select('id, created_at, requester:users!requester_id(id, nickname, avatar_url)')
    .eq('target_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function handleFollowRequest(requestId: string, accept: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: request } = await supabase
    .from('follow_requests')
    .select('requester_id, target_id')
    .eq('id', requestId)
    .eq('target_id', user.id)
    .single()

  if (!request) return { error: 'リクエストが見つかりません' }

  if (accept) {
    await supabase.from('follows').insert({
      follower_id: request.requester_id,
      following_id: request.target_id,
    })
  }

  await supabase.from('follow_requests').delete().eq('id', requestId)
  revalidatePath('/profile')
  return { error: null }
}
