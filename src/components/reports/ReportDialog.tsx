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
import { createReport, REPORT_REASONS } from '@/lib/actions/reports'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId?: string
  commentId?: string
}

export function ReportDialog({ open, onOpenChange, postId, commentId }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!selected) return
    startTransition(async () => {
      const result = await createReport({
        postId,
        commentId,
        reason: selected,
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
            通報する
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">通報理由を選択してください</p>
        <div className="space-y-2">
          {REPORT_REASONS.map(reason => (
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
