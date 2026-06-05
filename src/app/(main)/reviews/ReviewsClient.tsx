'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { NewReviewDialog } from '@/components/reviews/NewReviewDialog'
import type { CourseReview } from '@/types'

type SortKey = 'new' | 'ease' | 'recommendation'

interface Props {
  initialReviews: CourseReview[]
  universityName?: string
  currentUserId?: string
}

function getEaseScore(r: CourseReview) {
  const hardness = (r.difficulty + r.attendance + r.report_amount + r.test_difficulty) / 4
  return (6 - hardness) * 0.6 + r.recommendation * 0.4
}

export function ReviewsClient({ initialReviews, universityName, currentUserId }: Props) {
  const router = useRouter()
  const [reviews] = useState(initialReviews)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('new')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = reviews
    .filter(r =>
      r.course_name.includes(search) ||
      (r.professor_name ?? '').includes(search)
    )
    .sort((a, b) => {
      if (sort === 'ease')           return getEaseScore(b) - getEaseScore(a)
      if (sort === 'recommendation') return b.recommendation - a.recommendation
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'new',            label: '新着順'       },
    { key: 'ease',           label: '楽単度順'     },
    { key: 'recommendation', label: 'おすすめ順'   },
  ]

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background border-b px-4 py-3 space-y-2.5">
        {/* タイトル・投稿ボタン */}
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

        {/* 検索 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="授業名・教授名で検索"
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* ソートタブ */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sort === opt.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <p className="text-sm">{search ? `「${search}」のレビューはありません` : 'レビューがまだありません'}</p>
          {!search && <p className="text-xs">最初のレビューを投稿しましょう</p>}
        </div>
      ) : (
        <div>
          <p className="px-4 py-2 text-xs text-muted-foreground border-b">{filtered.length} 件</p>
          {filtered.map(review => (
            <ReviewCard key={review.id} review={review} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <NewReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
