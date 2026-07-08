'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportDialog } from '@/components/reports/ReportDialog'

interface Props {
  postId: string
  isBuySell?: boolean
}

export function PostReportButton({ postId, isBuySell = false }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
      >
        <Flag className="h-3.5 w-3.5" />
        通報
      </button>
      <ReportDialog open={open} onOpenChange={setOpen} postId={postId} isBuySell={isBuySell} />
    </>
  )
}
