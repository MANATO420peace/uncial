'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordResetEmail } from '@/lib/actions/auth'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await sendPasswordResetEmail(formData)
      if (result.error) {
        toast.error('メールの送信に失敗しました')
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <div className="space-y-1">
          <h2 className="font-bold text-lg">メールを送信しました</h2>
          <p className="text-sm text-muted-foreground">
            パスワードリセット用のリンクをメールで送りました。メールを確認してください。
          </p>
        </div>
        <Link href="/login" className="text-sm underline underline-offset-4">
          ログインに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">パスワードを忘れた方</h1>
        <p className="text-sm text-muted-foreground">
          登録したメールアドレスを入力してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="student@university.ac.jp"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '送信中...' : 'リセットメールを送信'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-4">
          ログインに戻る
        </Link>
      </p>
    </div>
  )
}
