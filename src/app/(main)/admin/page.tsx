import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminReportList } from './AdminReportList'

export const metadata: Metadata = { title: '管理者ダッシュボード' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) notFound()

  const { data: reportsRaw } = await supabase
    .from('reports')
    .select(`
      id, reason, created_at,
      reporter:users!reporter_id(id, nickname),
      post:posts(id, title, content, user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const reports = (reportsRaw ?? []).map(r => ({
    ...r,
    reporter: Array.isArray(r.reporter) ? r.reporter[0] ?? null : r.reporter,
    post: Array.isArray(r.post) ? r.post[0] ?? null : r.post,
  }))

  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-lg">管理者ダッシュボード</h1>
        <p className="text-xs text-muted-foreground mt-0.5">通報された投稿の一覧</p>
      </div>
      <AdminReportList reports={reports ?? []} />
    </div>
  )
}
