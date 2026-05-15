'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitContact } from '@/lib/actions/contact'

const CATEGORIES = ['バグ報告', '機能要望', 'アカウントについて', '不適切なコンテンツの報告', 'その他']

export default function ContactPage() {
  const [category, setCategory] = useState('')
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('category', category)
    startTransition(async () => {
      const result = await submitContact(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h2 className="font-bold text-lg">送信しました</h2>
        <p className="text-sm text-muted-foreground">お問い合わせありがとうございます。内容を確認次第、ご連絡いたします。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-lg">お問い合わせ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">ご意見・ご要望・不具合報告はこちら</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">お名前</Label>
          <Input id="name" name="name" placeholder="山田 太郎" required maxLength={50} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" name="email" type="email" placeholder="example@email.com" required />
        </div>

        <div className="space-y-1.5">
          <Label>カテゴリ</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">お問い合わせ内容</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="詳しい内容を入力してください"
            rows={6}
            required
            maxLength={2000}
            className="resize-none"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending || !category}>
          {isPending ? '送信中...' : '送信する'}
        </Button>
      </form>
    </div>
  )
}
