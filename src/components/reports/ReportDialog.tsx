'use client'

import { useState, useTransition } from 'react'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createReport } from '@/lib/actions/reports'
import { REPORT_REASONS, BUY_SELL_REPORT_REASONS } from '@/lib/reportReasons'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId?: string
  commentId?: string
  isBuySell?: boolean
}

export function ReportDialog({ open, onOpenChange, postId, commentId, isBuySell = false }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reasons = isBuySell ? BUY_SELL_REPORT_REASONS : REPORT_REASONS

  function handleSubmit() {
    if (!selected) return
    startTransition(async () => {
      const result = await createReport({
        postId,
        commentId,
        reason: selected,
        reportType: isBuySell ? 'buy_sell' : 'general',
      })
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('通報しました。ご協力ありがとうございます。')
        onOpenChange(false)
        setSelected(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            {isBuySell ? '出品を通報する' : '通報する'}
          </DialogTitle>
        </DialogHeader>
        {isBuySell && (
          <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            ⚠️ お金が絡むトラブルは運営が優先的に確認します
          </p>
        )}
        <p className="text-sm text-muted-foreground">通報理由を選択してください</p>
        <div className="space-y-2">
          {reasons.map(reason => (
            <button
              key={reason}
              type="button"
              onClick={() => setSelected(reason)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                selected === reason
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!selected || isPending}
            onClick={handleSubmit}
          >
            {isPending ? '送信中...' : '通報する'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
