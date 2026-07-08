'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateReportStatus } from '@/lib/actions/reports'

export function ReportActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handle(status: 'resolved' | 'dismissed') {
    startTransition(async () => {
      const result = await updateReportStatus(reportId, status)
      if (result?.error) { toast.error(result.error); return }
      toast.success(status === 'resolved' ? '解決済みにしました' : '却下しました')
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handle('resolved')}
        className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        解決済みにする
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handle('dismissed')}
        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
      >
        却下する
      </button>
    </div>
  )
}
