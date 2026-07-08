import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReports } from '@/lib/actions/reports'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { ReportActions } from './ReportActions'

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/home')

  const [generalReports, buySellReports] = await Promise.all([
    getReports('general'),
    getReports('buy_sell'),
  ])

  const generalPending = generalReports.filter((r: Record<string, unknown>) => r.status === 'pending')
  const buySellPending = buySellReports.filter((r: Record<string, unknown>) => r.status === 'pending')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">
      <h1 className="text-lg font-bold">通報管理</h1>

      {/* 出品通報 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">⚠️ 出品通報</h2>
          {buySellPending.length > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              {buySellPending.length}件未対応
            </span>
          )}
        </div>
        {buySellReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">出品への通報はありません ✅</p>
        ) : (
          <div className="space-y-3">
            {buySellReports.map((r: Record<string, unknown>) => (
              <ReportCard key={r.id as string} report={r} />
            ))}
          </div>
        )}
      </section>

      <div className="border-t" />

      {/* 通常通報 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">📋 通常通報</h2>
          {generalPending.length > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              {generalPending.length}件未対応
            </span>
          )}
        </div>
        {generalReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">通報はありません ✅</p>
        ) : (
          <div className="space-y-3">
            {generalReports.map((r: Record<string, unknown>) => (
              <ReportCard key={r.id as string} report={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ReportCard({ report }: { report: Record<string, unknown> }) {
  const r = report as {
    id: string
    reason: string
    status: string
    created_at: string
    report_type: string
    reporter?: { nickname: string }
    post?: { id: string; title: string }
    comment?: { id: string; content: string }
  }

  return (
    <div className={`border rounded-lg p-4 space-y-2 ${r.status === 'pending' ? 'border-red-200 dark:border-red-900' : 'opacity-60'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          r.status === 'pending' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
          r.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
          'bg-muted text-muted-foreground'
        }`}>
          {r.status === 'pending' ? '未対応' : r.status === 'resolved' ? '解決済み' : '却下'}
        </span>
        <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
      </div>

      <div className="text-sm"><span className="font-medium">理由：</span>{r.reason}</div>

      {r.post && (
        <div className="text-sm">
          <span className="font-medium">投稿：</span>
          <Link href={`/post/${r.post.id}`} className="text-primary underline ml-1">{r.post.title}</Link>
        </div>
      )}
      {r.comment && (
        <div className="text-sm">
          <span className="font-medium">コメント：</span>
          <span className="text-muted-foreground ml-1 line-clamp-2">{r.comment.content}</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground">通報者：{r.reporter?.nickname ?? '不明'}</div>

      {r.status === 'pending' && <ReportActions reportId={r.id} />}
    </div>
  )
}
