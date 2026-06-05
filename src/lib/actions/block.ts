'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleBlock(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (user.id === targetUserId) return { error: '自分はブロックできません' }

  const { data: existing } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('blocks').delete().eq('id', existing.id)
    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/home')
    return { blocked: false }
  } else {
    // ブロック時はフォロー関係・フォローリクエストも解除
    await Promise.all([
      supabase.from('follows').delete()
        .or(`and(follower_id.eq.${user.id},following_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},following_id.eq.${user.id})`),
      supabase.from('follow_requests').delete()
        .or(`and(requester_id.eq.${user.id},target_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},target_id.eq.${user.id})`),
      supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetUserId }),
    ])
    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/home')
    return { blocked: true }
  }
}

export async function toggleMute(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (user.id === targetUserId) return { error: '自分はミュートできません' }

  const { data: existing } = await supabase
    .from('mutes')
    .select('id')
    .eq('muter_id', user.id)
    .eq('muted_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('mutes').delete().eq('id', existing.id)
    revalidatePath('/home')
    return { muted: false }
  } else {
    await supabase.from('mutes').insert({ muter_id: user.id, muted_id: targetUserId })
    revalidatePath('/home')
    return { muted: true }
  }
}

export async function getBlockMuteStatus(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isBlocked: false, isMuted: false, isBlockedByThem: false }

  const [{ data: block }, { data: mute }, { data: blockedByThem }] = await Promise.all([
    supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', targetUserId).maybeSingle(),
    supabase.from('mutes').select('id').eq('muter_id', user.id).eq('muted_id', targetUserId).maybeSingle(),
    supabase.from('blocks').select('id').eq('blocker_id', targetUserId).eq('blocked_id', user.id).maybeSingle(),
  ])

  return {
    isBlocked: !!block,
    isMuted: !!mute,
    isBlockedByThem: !!blockedByThem,
  }
}

// フィード除外用: ブロック・ミュートしているユーザーのIDリストを取得
export async function getBlockedAndMutedIds() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { blockedIds: [], mutedIds: [] }

  const [{ data: blocks }, { data: mutes }] = await Promise.all([
    supabase.from('blocks').select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
    supabase.from('mutes').select('muted_id').eq('muter_id', user.id),
  ])

  const blockedIds = (blocks ?? []).map(b =>
    b.blocker_id === user.id ? b.blocked_id : b.blocker_id
  )
  const mutedIds = (mutes ?? []).map(m => m.muted_id)

  return { blockedIds, mutedIds }
}
