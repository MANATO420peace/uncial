'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteReview } from '@/lib/actions/reviews'
import { timeAgo, cn } from '@/lib/utils'
import type { CourseReview } from '@/types'

interface Props {
  review: CourseReview
  currentUserId?: string
}

const SCORE_FIELDS = [
  { key: 'difficulty',      label: '難易度',    invert: true  },
  { key: 'attendance',      label: '出席',       invert: true  },
  { key: 'report_amount',   label: 'レポート',   invert: true  },
  { key: 'test_difficulty', label: 'テスト',     invert: true  },
  { key: 'recommendation',  label: 'おすすめ',   invert: false },
] as const

function ScoreBar({ value, invert }: { value: number; invert: boolean }) {
  const goodness = invert ? 6 - value : value
  const colorClass =
    goodness >= 4 ? 'bg-emerald-500' :
    goodness >= 3 ? 'bg-amber-400' :
    'bg-rose-400'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', colorClass)}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground w-4 text-right tabular-nums">{value}</span>
    </div>
  )
}

function getEaseScore(review: CourseReview) {
  const hardness = (review.difficulty + review.attendance + review.report_amount + review.test_difficulty) / 4
  const ease = 6 - hardness
  return (ease * 0.6 + review.recommendation * 0.4).toFixed(1)
}

function getEaseLabel(score: string) {
  const n = parseFloat(score)
  if (n >= 4.5) return { label: '超楽単', color: 'text-emerald-600 dark:text-emerald-400' }
  if (n >= 3.5) return { label: '楽単',   color: 'text-green-600 dark:text-green-400'    }
  if (n >= 2.5) return { label: '普通',   color: 'text-amber-600 dark:text-amber-400'    }
  if (n >= 1.5) return { label: '難しい', color: 'text-orange-600 dark:text-orange-400'  }
  return             { label: '鬼難',     color: 'text-rose-600 dark:text-rose-400'      }
}

export function ReviewCard({ review, currentUserId }: Props) {
  const [deleted, setDeleted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isOwner = currentUserId === review.user_id
  const easeScore = getEaseScore(review)
  const { label: easeLabel, color: easeColor } = getEaseLabel(easeScore)

  if (deleted) return null

  function handleDelete() {
    if (!confirm('このレビューを削除しますか？')) return
    startTransition(async () => {
      const result = await deleteReview(review.id)
      if (result?.error) { toast.error(result.error); return }
      setDeleted(true)
      toast.success('レビューを削除しました')
    })
  }

  return (
    <article className="px-4 py-4 border-b">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm leading-tight">{review.course_name}</h3>
          {review.professor_name && (
            <p className="text-xs text-muted-foreground mt-0.5">{review.professor_name} 先生</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className={cn('text-2xl font-black leading-none', easeColor)}>{easeScore}</p>
          <p className={cn('text-[11px] font-semibold', easeColor)}>{easeLabel}</p>
        </div>
      </div>

      {/* スコアバー */}
      <div className="space-y-1.5 mb-3">
        {SCORE_FIELDS.map(({ key, label, invert }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-14 shrink-0">{label}</span>
            <ScoreBar value={review[key]} invert={invert} />
          </div>
        ))}
      </div>

      {/* コメント */}
      {review.review_text && (
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-lg px-3 py-2 mb-2">
          &quot;{review.review_text}&quot;
        </p>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {review.universities && <span>{review.universities.name}</span>}
          <span>{timeAgo(review.created_at)}</span>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="削除"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  )
}
