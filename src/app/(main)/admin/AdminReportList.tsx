'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/utils'
import { deletePost } from '@/lib/actions/posts'

interface Report {
  id: string
  reason: string
  created_at: string
  reporter: { id: string; nickname: string } | null
  post: { id: string; title: string; content: string; user_id: string } | null
}

interface Props {
  reports: Report[]
}

export function AdminReportList({ reports }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function handleDelete(postId: string, reportId: string) {
    startTransition(async () => {
      await deletePost(postId)
      setDismissed(prev => new Set([...prev, reportId]))
      toast.success('投稿を削除しました')
    })
  }

  const visible = reports.filter(r => !dismissed.has(r.id))

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <p className="text-sm">通報はありません</p>
      </div>
    )
  }

  return (
    <ul className="divide-y">
      {visible.map(report => (
        <li key={report.id} className="px-4 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="destructive" className="text-[10px]">{report.reason}</Badge>
            <span className="text-xs text-muted-foreground">{timeAgo(report.created_at)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            通報者: {report.reporter?.nickname ?? '不明'}
          </p>
          {report.post && (
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <p className="text-sm font-semibold line-clamp-1">{report.post.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{report.post.content}</p>
            </div>
          )}
          <div className="flex gap-2">
            {report.post && (
              <Link href={`/post/${report.post.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  <ExternalLink className="h-3 w-3" />
                  投稿を確認
                </Button>
              </Link>
            )}
            {report.post && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-1"
                disabled={isPending}
                onClick={() => handleDelete(report.post!.id, report.id)}
              >
                <Trash2 className="h-3 w-3" />
                投稿を削除
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(prev => new Set([...prev, report.id]))}
            >
              無視
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
