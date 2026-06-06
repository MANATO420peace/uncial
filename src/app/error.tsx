'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">500</h1>
        <p className="text-muted-foreground">サーバーエラーが発生しました</p>
        <p className="text-sm text-muted-foreground mt-1">しばらく時間をおいて再度お試しください</p>
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className={buttonVariants({ variant: 'outline' })}>
          再試行
        </button>
        <Link href="/home" className={buttonVariants()}>
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
