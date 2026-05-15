'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from './StarRating'
import { createReview } from '@/lib/actions/reviews'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const RATING_FIELDS = [
  { name: 'difficulty', label: '難易度' },
  { name: 'attendance', label: '出席厳しさ' },
  { name: 'report_amount', label: 'レポート量' },
  { name: 'test_difficulty', label: 'テスト難易度' },
  { name: 'recommendation', label: 'おすすめ度' },
] as const

export function NewReviewDialog({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [ratings, setRatings] = useState<Record<string, number>>({
    difficulty: 3,
    attendance: 3,
    report_amount: 3,
    test_difficulty: 3,
    recommendation: 3,
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    Object.entries(ratings).forEach(([key, value]) => {
      formData.set(key, String(value))
    })
    const result = await createReview(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('レビューを投稿しました')
      onOpenChange(false)
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>楽単レビューを書く</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="course-name">授業名 *</Label>
            <Input id="course-name" name="course_name" placeholder="情報工学概論" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="professor-name">教授名</Label>
            <Input id="professor-name" name="professor_name" placeholder="山田 太郎" />
          </div>

          <div className="space-y-3 pt-1">
            {RATING_FIELDS.map(({ name, label }) => (
              <div key={name} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <StarRating
                  value={ratings[name]}
                  onChange={v => setRatings(r => ({ ...r, [name]: v }))}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-text">コメント（任意）</Label>
            <Textarea
              id="review-text"
              name="review_text"
              placeholder="授業の雰囲気や試験についてなど..."
              rows={3}
              maxLength={500}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '投稿中...' : 'レビューを投稿'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
