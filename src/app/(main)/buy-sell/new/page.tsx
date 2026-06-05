'use client'

import { useState, useEffect, useTransition } from 'react'
import { ChevronLeft, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/posts/ImageUpload'
import { createPost, getBuySellEligibility } from '@/lib/actions/posts'
import { uploadImages } from '@/lib/uploadImages'
import { ITEM_CONDITION_LABELS, type ItemCondition } from '@/types'

const CONDITIONS = Object.entries(ITEM_CONDITION_LABELS) as [ItemCondition, string][]

const ITEM_CATEGORIES = [
  '教科書・参考書',
  'ノート・プリント',
  'PC・タブレット',
  'スマートフォン',
  '家具・家電',
  '衣類・ファッション',
  'スポーツ・アウトドア',
  '自転車・乗り物',
  '食品・飲料',
  'その他',
]

const DELIVERY_METHODS = [
  { value: 'handover', label: '手渡しのみ' },
  { value: 'shipping', label: '郵送のみ' },
  { value: 'both',     label: '手渡し・郵送どちらも可' },
]

const TERMS = `【販売・購入 利用規約】

1. 本カテゴリは大学のメールアドレス（.ac.jp）を持つユーザーのみ利用できます。
2. 違法・有害な商品の売買は禁止します。
3. 個人情報の取り扱いには十分注意してください。
4. トラブルはユーザー間で解決してください。運営は責任を負いません。
5. 不正利用が確認された場合、アカウントを停止することがあります。`

export default function BuySellNewPage() {
  const [isPending, startTransition] = useTransition()
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [eligibility, setEligibility] = useState<{ isUniversityEmail: boolean; hasAgreedTerms: boolean } | null>(null)
  const [step, setStep] = useState<'check' | 'form'>('check')
  const [imageFiles, setImageFiles] = useState<File[]>([])

  useEffect(() => {
    getBuySellEligibility().then((result) => {
      setEligibility(result)
      if (result.hasAgreedTerms) setTermsAgreed(true)
    })
  }, [])

  const canProceed = eligibility?.isUniversityEmail && termsAgreed

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    startTransition(async () => {
      const formData = new FormData(form)
      formData.set('category', 'buy_sell')
      formData.set('anonymous', 'false')
      formData.set('terms_agreed', 'true')
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
        <Link href="/buy-sell" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Link>
      </div>

      <div className="px-4 py-5 space-y-5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h1 className="text-lg font-bold">出品する</h1>
        </div>

        {step === 'check' && (
          <div className="space-y-5">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-semibold">本人確認</p>
              {eligibility == null ? (
                <p className="text-sm text-muted-foreground">確認中...</p>
              ) : eligibility.isUniversityEmail ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  大学メールアドレス（.ac.jp）が確認されました
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4 shrink-0" />
                    大学のメールアドレス（.ac.jp）が必要です
                  </div>
                  <p className="text-xs text-muted-foreground">
                    出品するには大学メール（例: xxx@keio.ac.jp）で登録されたアカウントが必要です。
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">利用規約</p>
              <div className="bg-muted rounded p-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {TERMS}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  disabled={eligibility?.hasAgreedTerms}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="terms" className="cursor-pointer font-normal text-sm">
                  {eligibility?.hasAgreedTerms ? '利用規約に同意済み' : '利用規約に同意する'}
                </Label>
              </div>
            </div>

            <Button className="w-full" disabled={!canProceed} onClick={() => setStep('form')}>
              次へ進む
            </Button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 商品画像 */}
            <div className="space-y-1.5">
              <Label>商品画像（最大4枚）</Label>
              <ImageUpload files={imageFiles} onChange={setImageFiles} />
            </div>

            {/* タイトル */}
            <div className="space-y-1.5">
              <Label htmlFor="title">商品名 <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" placeholder="例: 教科書「経済学入門 第3版」" required maxLength={100} />
            </div>

            {/* 価格 */}
            <div className="space-y-1.5">
              <Label htmlFor="price">価格（円） <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">¥</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  max={9999999}
                  placeholder="3000"
                  required
                  className="pl-7"
                />
              </div>
            </div>

            {/* 商品カテゴリ */}
            <div className="space-y-1.5">
              <Label htmlFor="item_category">商品カテゴリ <span className="text-destructive">*</span></Label>
              <select
                id="item_category"
                name="item_category"
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">選択してください</option>
                {ITEM_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 商品の状態 */}
            <div className="space-y-1.5">
              <Label htmlFor="item_condition">商品の状態 <span className="text-destructive">*</span></Label>
              <select
                id="item_condition"
                name="item_condition"
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">選択してください</option>
                {CONDITIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 受け渡し方法 */}
            <div className="space-y-1.5">
              <Label htmlFor="delivery_method">受け渡し方法 <span className="text-destructive">*</span></Label>
              <select
                id="delivery_method"
                name="delivery_method"
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">選択してください</option>
                {DELIVERY_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* 値下げ交渉 */}
            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="price_negotiable"
                name="price_negotiable"
                value="true"
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="price_negotiable" className="cursor-pointer font-normal">
                値下げ交渉あり
              </Label>
            </div>

            {/* 説明 */}
            <div className="space-y-1.5">
              <Label htmlFor="content">商品説明 <span className="text-destructive">*</span></Label>
              <Textarea
                id="content"
                name="content"
                placeholder="商品の詳細、状態の補足、配送料の負担などを記載してください"
                required
                rows={5}
                maxLength={2000}
                className="resize-none"
              />
            </div>

            {/* タグ */}
            <div className="space-y-1.5">
              <Label htmlFor="tags">タグ（カンマ区切り・任意）</Label>
              <Input id="tags" name="tags" placeholder="例: 教科書, 経済学, 美品" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('check')}>
                戻る
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? '出品中...' : '出品する'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
