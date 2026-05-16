'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  postId: string
  title: string
}

export function ShareButton({ postId, title }: Props) {
  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const url = `${window.location.origin}/post/${postId}`
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('リンクをコピーしました')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
    >
      <Share2 className="h-3 w-3" />
    </button>
  )
}
