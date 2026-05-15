'use client'

import { useState } from 'react'
import { MoreHorizontal, Flag } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createReport } from '@/lib/actions/reports'

const REASONS = [
  'スパム・宣伝',
  '不適切なコンテンツ',
  '誹謗中傷・ハラスメント',
  '個人情報の掲載',
  'その他',
]

interface Props {
  postId?: string
  commentId?: string
}

export function ReportButton({ postId, commentId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReport(reason: string) {
    setLoading(true)
    const result = await createReport({ postId, commentId, reason })
    setLoading(false)
    setOpen(false)
    if (result.error) {
      toast.error('通報に失敗しました')
    } else {
      toast.success('通報を受け付けました')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors outline-none" onClick={(e) => e.preventDefault()}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={() => setOpen(true)}
          >
            <Flag className="h-4 w-4 mr-2" />
            通報する
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>通報する理由を選択</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {REASONS.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
                onClick={() => handleReport(reason)}
              >
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
