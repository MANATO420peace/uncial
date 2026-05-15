'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { NewReviewDialog } from '@/components/reviews/NewReviewDialog'
import type { CourseReview } from '@/types'

interface Props {
  initialReviews: CourseReview[]
  universityName?: string
}

export function ReviewsClient({ initialReviews, universityName }: Props) {
  const [reviews] = useState(initialReviews)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = reviews.filter(r =>
    r.course_name.includes(search) ||
    (r.professor_name ?? '').includes(search)
  )

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base">楽単レビュー</h1>
            {universityName && (
              <p className="text-xs text-muted-foreground">{universityName}</p>
            )}
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            レビューを書く
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="授業名・教授名で検索"
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <p className="text-sm">レビューがまだありません</p>
          <p className="text-xs">最初のレビューを投稿しましょう</p>
        </div>
      ) : (
        <div>
          {filtered.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      <NewReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
