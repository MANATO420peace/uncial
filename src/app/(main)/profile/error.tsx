'use client'

import { useEffect } from 'react'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Profile Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
      <p className="text-sm font-bold text-foreground">読み込みに失敗しました</p>
      <p className="text-xs text-center">時間をおいてもう一度お試しください</p>
      <button
        onClick={reset}
        className="text-xs px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
      >
        再試行
      </button>
    </div>
  )
}
