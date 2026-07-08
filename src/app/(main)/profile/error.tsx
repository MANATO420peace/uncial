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
    <div className="px-4 py-8 space-y-3">
      <p className="text-sm font-bold text-destructive">プロフィールの読み込みに失敗しました</p>
      <p className="text-xs text-muted-foreground break-all">{error.message}</p>
      <button
        onClick={reset}
        className="text-xs px-3 py-1.5 rounded border hover:bg-muted"
      >
        再試行
      </button>
    </div>
  )
}
