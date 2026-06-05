'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  userId: string
  nickname: string
}

export function ProfileShareButton({ userId, nickname }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/user/${userId}`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${nickname}さんのプロフィール | ユニキャン`, url })
        return
      } catch {
        // キャンセルや非対応の場合はコピーにフォールバック
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('プロフィールURLをコピーしました')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="h-9 w-9 flex items-center justify-center rounded-full border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="プロフィールをシェア"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
    </button>
  )
}
