'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Props {
  userId: string
}

export function TimetableShareButton({ userId }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/timetable?view=${userId}`

    if (navigator.share) {
      try {
        await navigator.share({ title: '時間割をシェア | ユニキャン', url })
        return
      } catch {
        // フォールバック
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('時間割のURLをコピーしました')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
      {copied
        ? <><Check className="h-3.5 w-3.5 text-green-500" />コピー済み</>
        : <><Share2 className="h-3.5 w-3.5" />シェア</>
      }
    </Button>
  )
}
