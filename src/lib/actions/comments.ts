'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const { data: newComment, error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    parent_id: parentId || null,
    content,
    anonymous,
  }).select('id').single()

  if (error) return { error: error.message }

  if (parentId) {
    // 返信の場合: 親コメントの投稿者に返信通知
    const { data: parentComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', parentId)
      .single()
    if (parentComment && parentComment.user_id !== user.id) {
      await createNotification({
        userId: parentComment.user_id,
        actorId: user.id,
        type: 'comment_reply',
        postId,
        commentId: newComment?.id,
        isAnonymous: anonymous,
      } as never)
    }
  } else {
    // 通常コメントの場合: 投稿者に通知
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
    if (post) {
      await createNotification({ userId: post.user_id, actorId: user.id, type: 'comment', postId, commentId: newComment?.id, isAnonymous: anonymous })
    }
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

  // adminクライアントでlikes_countを確実に更新（RLSで他人のコメントを更新できない問題を回避）
  let admin: ReturnType<typeof createAdminClient> | typeof supabase
  try { admin = createAdminClient() } catch { admin = supabase }

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id)
    const { count } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)
    await admin.from('comments').update({ likes_count: count ?? 0 }).eq('id', commentId)
    revalidatePath(`/post/${postId}`)
    return { liked: false, likesCount: count ?? 0 }
  } else {
    await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId })
    const { count } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)
    await admin.from('comments').update({ likes_count: count ?? 0 }).eq('id', commentId)

    // コメント投稿者に「いいね」通知を送る
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single()
    if (comment && comment.user_id !== user.id) {
      await createNotification({
        userId: comment.user_id,
        actorId: user.id,
        type: 'comment_like',
        postId,
        commentId,
        isAnonymous: false,
      } as never)
    }

    revalidatePath(`/post/${postId}`)
    return { liked: true, likesCount: count ?? 0 }
  }
}

export async function getRepliedPosts(userId: string) {
  try {
    const supabase = await createClient()

    // 自分がコメントした投稿（親コメント・返信どちらも含む）を取得（重複なし）
    const { data: comments, error } = await supabase
      .from('comments')
      .select('post_id, posts(*, users(id, nickname), universities(id, name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !comments) return []

    // 投稿IDで重複を除く
    const seen = new Set<string>()
    const posts = []
    for (const c of comments) {
      const post = c.posts as { id: string } | null
      if (post && !seen.has(post.id)) {
        seen.add(post.id)
        posts.push(post)
      }
    }
    return posts
  } catch {
    return []
  }
}
