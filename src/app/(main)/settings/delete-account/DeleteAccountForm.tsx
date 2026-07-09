'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle } from 'lucide-react'
import { deleteAccount } from '@/lib/actions/deleteAccount'
import { Button } from '@/components/ui/button'

export function DeleteAccountForm() {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const allChecked = checked1 && checked2 && checked3

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      {/* 警告ボックス */}
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          退会に関する重要なポリシー
        </div>
        <ul className="text-sm text-foreground/80 space-y-2 list-none">
          <li className="flex gap-2">
            <span className="text-destructive font-bold shrink-0">·</span>
            同じメールアドレスでの再登録はできません。
          </li>
          <li className="flex gap-2">
            <span className="text-destructive font-bold shrink-0">·</span>
            投稿・コメント・メッセージなどのデータはすべて削除されます。
          </li>
          <li className="flex gap-2">
            <span className="text-destructive font-bold shrink-0">·</span>
            一度削除したアカウントは復元できません。
          </li>
        </ul>
      </div>

      {/* 確認チェックボックス */}
      <div className="space-y-3">
        <p className="text-sm font-medium">以下の内容を確認してチェックしてください</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked1}
            onChange={(e) => setChecked1(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-destructive"
          />
          <span className="text-sm">
            同じメールアドレスで再登録できないことを理解しました
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked2}
            onChange={(e) => setChecked2(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-destructive"
          />
          <span className="text-sm">
            投稿・メッセージなどのデータがすべて削除されることを理解しました
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked3}
            onChange={(e) => setChecked3(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-destructive"
          />
          <span className="text-sm">
            この操作は取り消せないことを理解しました
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        variant="destructive"
        className="w-full"
        disabled={!allChecked || isPending}
        onClick={handleDelete}
      >
        {isPending ? '退会処理中...' : 'アカウントを削除する'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        退会後はログイン画面に戻ります
      </p>
    </div>
  )
}
