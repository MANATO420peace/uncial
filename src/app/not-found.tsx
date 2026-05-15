import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground">ページが見つかりませんでした</p>
      </div>
      <Link href="/home" className={buttonVariants()}>
        ホームに戻る
      </Link>
    </div>
  )
}
