'use server'

import { createClient } from '@/lib/supabase/server'

export async function createReport({
  postId,
  commentId,
  reason,
}: {
  postId?: string
  commentId?: string
  reason: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
    reason,
  })

  if (error) return { error: error.message }
  return { error: null }
}
