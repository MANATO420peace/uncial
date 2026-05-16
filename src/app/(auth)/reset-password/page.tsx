'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/lib/actions/auth'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      toast.error('パスワードが一致しません')
      return
    }

    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">新しいパスワードを設定</h1>
        <p className="text-sm text-muted-foreground">6文字以上で入力してください</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">新しいパスワード</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="6文字以上"
            required
            minLength={6}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">パスワードを確認</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="もう一度入力"
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '更新中...' : 'パスワードを更新'}
        </Button>
      </form>
    </div>
  )
}
