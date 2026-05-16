'use client'

import { useState, useTransition } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { resendVerificationEmail, signOut } from '@/lib/actions/auth'

export default function VerifyEmailPage() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function handleResend() {
    startTransition(async () => {
      const result = await resendVerificationEmail()
      if (result?.error) {
        toast.error(result.error)
      } else {
        setSent(true)
        toast.success('確認メールを再送しました')
      }
    })
  }

  return (
    <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 text-center space-y-5">
      <div className="flex justify-center">
        <div className="bg-primary/10 rounded-full p-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-bold text-xl">メールを確認してください</h1>
        <p className="text-sm text-muted-foreground">
          登録時に送信した確認メールのリンクをクリックして、アカウントを有効化してください。
        </p>
      </div>

      <Button
        className="w-full"
        onClick={handleResend}
        disabled={isPending || sent}
      >
        {sent ? '送信済み' : isPending ? '送信中...' : '確認メールを再送する'}
      </Button>

      <button
        onClick={() => signOut()}
        className="text-xs text-muted-foreground hover:underline"
      >
        別のアカウントでログイン
      </button>
    </div>
  )
}
