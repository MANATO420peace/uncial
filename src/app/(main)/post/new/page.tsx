'use client'

import { useState, useEffect, useTransition } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/posts/ImageUpload'
import { createPost, getBuySellEligibility } from '@/lib/actions/posts'
import { uploadImages } from '@/lib/uploadImages'
import { POST_CATEGORY_LABELS, type PostCategory } from '@/types'

const CATEGORIES = Object.entries(POST_CATEGORY_LABELS) as [PostCategory, string][]

const TERMS = `【販売・購入 利用規約】

1. 本カテゴリは大学のメールアドレス（.ac.jp）を持つユーザーのみ利用できます。
2. 違法・有害な商品の売買は禁止します。
3. 個人情報の取り扱いには十分注意してください。
4. トラブルはユーザー間で解決してください。運営は責任を負いません。
5. 不正利用が確認された場合、アカウントを停止することがあります。`

export default function NewPostPage() {
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<string>('')
  const [anonymous, setAnonymous] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [eligibility, setEligibility] = useState<{ isUniversityEmail: boolean; hasAgreedTerms: boolean } | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const categoryLabel = category ? POST_CATEGORY_LABELS[category as PostCategory] : ''
  const isBuySell = category === 'buy_sell'

  useEffect(() => {
    if (isBuySell && !eligibility) {
      getBuySellEligibility().then(setEligibility)
    }
  }, [isBuySell, eligibility])

  useEffect(() => {
    if (eligibility?.hasAgreedTerms) setTermsAgreed(true)
  }, [eligibility])

  const canSubmit = isBuySell
    ? eligibility?.isUniversityEmail && termsAgreed
    : !!category

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!category) { toast.error('カテゴリを選択してください'); return }
    const form = e.currentTarget
    startTransition(async () => {
      const formData = new FormData(form)
      formData.set('category', category)
      formData.set('anonymous', String(anonymous))
      if (isBuySell) formData.set('terms_agreed', String(termsAgreed))
      if (imageFiles.length > 0) {
        const urls = await uploadImages(imageFiles)
        formData.set('images', JSON.stringify(urls))
      }
      const result = await createPost(formData)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background border-b px-4 h-10 flex items-center gap-2">
        <Link href="/home" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold">投稿を作成</h1>

        <div className="space-y-1.5">
          <Label>カテゴリ</Label>
          <Select value={category} onValueChange={(v) => { setCategory(v ?? ''); setEligibility(null) }}>
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択">{categoryLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isBuySell && (
          <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
            <p className="text-sm font-semibold">販売・購入カテゴリの利用条件</p>
            <div className="flex items-center gap-2 text-sm">
              {eligibility == null ? (
                <span className="text-muted-foreground">確認中...</span>
              ) : eligibility.isUniversityEmail ? (
                <span className="text-green-600">✅ 大学メールアドレス確認済み</span>
              ) : (
                <span className="text-red-600">❌ 大学のメールアドレス（.ac.jp）が必要です</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="bg-background rounded border p-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {TERMS}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="terms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} disabled={eligibility?.hasAgreedTerms} className="h-4 w-4 rounded border-input" />
                <Label htmlFor="terms" className="cursor-pointer font-normal text-sm">
                  {eligibility?.hasAgreedTerms ? '利用規約に同意済み' : '利用規約に同意する'}
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" placeholder="タイトルを入力" required maxLength={100} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">本文</Label>
          <Textarea id="content" name="content" placeholder="内容を入力してください" required rows={6} maxLength={2000} className="resize-none" />
        </div>

        <div className="space-y-1.5">
          <Label>画像（任意）</Label>
          <ImageUpload files={imageFiles} onChange={setImageFiles} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">場所（任意）</Label>
          <Input id="location" name="location" placeholder="例: A棟前、図書館" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">タグ（カンマ区切り）</Label>
          <Input id="tags" name="tags" placeholder="例: 数学, 試験対策" />
        </div>

        <div className="flex items-center gap-3 py-1">
          <input type="checkbox" id="anonymous" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 rounded border-input" />
          <Label htmlFor="anonymous" className="cursor-pointer font-normal">匿名で投稿</Label>
        </div>

        <Button type="submit" className="w-full" disabled={isPending || !canSubmit}>
          {isPending ? '投稿中...' : '投稿する'}
        </Button>
      </form>
    </div>
  )
}
