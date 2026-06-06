import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { getUniversities } from '@/lib/actions/user'

export const metadata: Metadata = { title: '新規登録' }

export default async function RegisterPage() {
  const universities = await getUniversities()

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">アカウント作成</h1>
        <p className="text-sm text-muted-foreground">unicanへようこそ</p>
      </div>
      <RegisterForm universities={universities} />
      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:no-underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
