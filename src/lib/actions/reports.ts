'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createReport({
  postId,
  commentId,
  reason,
  reportType = 'general',
}: {
  postId?: string
  commentId?: string
  reason: string
  reportType?: 'general' | 'buy_sell'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // 重複チェック
  if (postId) {
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('post_id', postId)
      .maybeSingle()
    if (existing) return { error: 'すでに通報済みです' }
  }
  if (commentId) {
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('comment_id', commentId)
      .maybeSingle()
    if (existing) return { error: 'すでに通報済みです' }
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
    reason,
    report_type: reportType,
  })

  if (error) return { error: error.message }
  return { error: null }
}

export async function getReports(reportType?: 'general' | 'buy_sell') {
  const admin = createAdminClient()
  let query = admin
    .from('reports')
    .select(`
      *,
      reporter:reporter_id(nickname),
      post:post_id(id, title, category),
      comment:comment_id(id, content)
    `)
    .order('created_at', { ascending: false })

  if (reportType) {
    query = query.eq('report_type', reportType)
  }

  const { data } = await query
  return data ?? []
}

export async function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
  const admin = createAdminClient()
  const { error } = await admin
    .from('reports')
    .update({ status })
    .eq('id', reportId)
  if (error) return { error: error.message }
  return { error: null }
}
