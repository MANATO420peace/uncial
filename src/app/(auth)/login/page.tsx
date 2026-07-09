import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { SetupBanner } from '@/components/auth/SetupBanner'

export const metadata: Metadata = { title: 'ログイン' }

const isConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('your_')

interface Props {
  searchParams: Promise<{ error?: string; deleted?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  university_email_required: '大学のメールアドレス（〜@〜.ac.jp）をお持ちの方のみ利用できます',
  auth_error: '認証に失敗しました。もう一度お試しください',
}

const INFO_MESSAGES: Record<string, string> = {
  deleted: 'アカウントを削除しました。ご利用ありがとうございました。',
}

const FEATURES = ['掲示板', 'フリマ', '時間割', 'DM'] as const

export default async function LoginPage({ searchParams }: Props) {
  const { error, deleted } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] : null
  const infoMessage = deleted ? INFO_MESSAGES['deleted'] : null

  return (
    <div className="space-y-8">
      {/* ロゴ・キャッチ */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
          bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
          shadow-lg dark:shadow-none mb-1">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-slate-900 dark:text-white">u</span>
            <span className="text-[#4299e1]">c</span>
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-none">
            <span className="text-slate-900 dark:text-white">uni</span>
            <span className="text-[#4299e1]">can</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">大学生だけのクローズドコミュニティ</p>
        </div>

        {/* 機能チップ */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {FEATURES.map((f) => (
            <span key={f}
              className="text-xs px-2.5 py-0.5 rounded-full
                bg-blue-50 dark:bg-blue-500/10
                text-blue-600 dark:text-blue-400
                border border-blue-100 dark:border-blue-500/20">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* フォームカード */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/8
        bg-white/80 dark:bg-white/[0.03]
        backdrop-blur-sm shadow-xl dark:shadow-none p-6 space-y-4">

        {!isConfigured && <SetupBanner />}
        {infoMessage && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 text-center">
            {infoMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
            {errorMessage}
          </div>
        )}
        <LoginForm disabled={!isConfigured} />
      </div>

      {/* 新規登録リンク */}
      <p className="text-center text-sm text-muted-foreground">
        アカウントがない方は{' '}
        <Link href="/register" className="text-[#4299e1] font-medium hover:underline underline-offset-4">
          新規登録
        </Link>
      </p>

    </div>
  )
}
