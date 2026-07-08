'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const REPORT_REASONS = [
  'スパム・宣伝',
  '誹謗中傷・嫌がらせ',
  '個人情報の漏洩',
  '不適切なコンテンツ',
  '偽情報・デマ',
  'その他',
] as const

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
  })

  if (error) return { error: error.message }
  return { error: null }
}

export async function getReports() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('reports')
    .select(`
      *,
      reporter:reporter_id(nickname),
      post:post_id(id, title),
      comment:comment_id(id, content)
    `)
    .order('created_at', { ascending: false })
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
