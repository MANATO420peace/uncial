import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { SetupBanner } from '@/components/auth/SetupBanner'

export const metadata: Metadata = { title: 'ログイン' }

const isConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('your_')

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">ユニキャン</h1>
        <p className="text-sm text-muted-foreground">大学生のコミュニティ</p>
      </div>
      {!isConfigured && <SetupBanner />}
      <LoginForm disabled={!isConfigured} />
      <p className="text-center text-sm text-muted-foreground">
        アカウントがない方は{' '}
        <Link href="/register" className="text-foreground underline underline-offset-4 hover:no-underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
