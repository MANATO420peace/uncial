import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReports, updateReportStatus } from '@/lib/actions/reports'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'

const ADMIN_USER_IDS = [
  // ここにあなたのユーザーIDを入れる
  // Supabase Authentication → Users から確認できます
]

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 管理者チェック（IDリストが空の場合は自分のIDでアクセス可能）
  if (!user || (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(user.id))) {
    redirect('/home')
  }

  const reports = await getReports()
  const pending = reports.filter(r => r.status === 'pending')
  const resolved = reports.filter(r => r.status !== 'pending')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold mb-6">通報管理</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          未対応 ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-sm text-muted-foreground">未対応の通報はありません ✅</p>
        )}
        <div className="space-y-3">
          {pending.map(r => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          対応済み ({resolved.length})
        </h2>
        <div className="space-y-3">
          {resolved.slice(0, 20).map(r => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
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

      <div className="text-sm">
        <span className="font-medium">理由：</span>{r.reason}
      </div>

      {r.post && (
        <div className="text-sm">
          <span className="font-medium">投稿：</span>
          <Link href={`/post/${r.post.id}`} className="text-primary underline ml-1">
            {r.post.title}
          </Link>
        </div>
      )}
      {r.comment && (
        <div className="text-sm">
          <span className="font-medium">コメント：</span>
          <span className="text-muted-foreground ml-1 line-clamp-2">{r.comment.content}</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        通報者：{r.reporter?.nickname ?? '不明'}
      </div>

      {r.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <form action={async () => {
            'use server'
            await updateReportStatus(r.id, 'resolved')
          }}>
            <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
              解決済みにする
            </button>
          </form>
          <form action={async () => {
            'use server'
            await updateReportStatus(r.id, 'dismissed')
          }}>
            <button type="submit" className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors">
              却下する
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
