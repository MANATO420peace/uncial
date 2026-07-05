'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'

export async function createComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const postId = formData.get('post_id') as string
  const content = formData.get('content') as string
  const parentId = formData.get('parent_id') as string | null
  const anonymous = formData.get('anonymous') === 'true'

  if (!content.trim()) return { error: 'コメントを入力してください' }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    parent_id: parentId || null,
    content,
    anonymous,
  })

  if (error) return { error: error.message }

  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
  if (post) {
    await createNotification({ userId: post.user_id, actorId: user.id, type: 'comment', postId, isAnonymous: anonymous })
  }

  revalidatePath(`/post/${postId}`)
  return { error: null }
}

export async function getComments(postId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*, users(id, nickname)')
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) return { comments: [], error: error.message }

  const { data: replies } = await supabase
    .from('comments')
    .select('*, users(id, nickname)')
    .eq('post_id', postId)
    .not('parent_id', 'is', null)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  let likedCommentIds = new Set<string>()

  if (user) {
    const allIds = [...(data ?? []), ...(replies ?? [])].map(c => c.id)
    const { data: clikes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.id)
      .in('comment_id', allIds)
    likedCommentIds = new Set(clikes?.map(l => l.comment_id) ?? [])
  }

  const replyMap = new Map<string, typeof replies>()
  replies?.forEach(r => {
    const arr = replyMap.get(r.parent_id) ?? []
    arr.push({ ...r, liked: likedCommentIds.has(r.id) })
    replyMap.set(r.parent_id, arr)
  })

  const comments = (data ?? []).map(c => ({
    ...c,
    liked: likedCommentIds.has(c.id),
    replies: replyMap.get(c.id) ?? [],
  }))

  return { comments, error: null }
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/post/${postId}`)
  return { error: null }
}

export async function toggleCommentLike(commentId: string, postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id)
    revalidatePath(`/post/${postId}`)
    return { liked: false }
  } else {
    await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId })
    revalidatePath(`/post/${postId}`)
    return { liked: true }
  }
}
