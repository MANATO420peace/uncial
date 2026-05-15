import { StarRating } from './StarRating'
import { timeAgo } from '@/lib/utils'
import type { CourseReview } from '@/types'

interface Props {
  review: CourseReview
}

const REVIEW_FIELDS = [
  { key: 'difficulty', label: '難易度' },
  { key: 'attendance', label: '出席厳しさ' },
  { key: 'report_amount', label: 'レポート量' },
  { key: 'test_difficulty', label: 'テスト難易度' },
  { key: 'recommendation', label: 'おすすめ度' },
] as const

export function ReviewCard({ review }: Props) {
  const avgScore = (
    (review.difficulty + review.attendance + review.report_amount +
     review.test_difficulty + review.recommendation) / 5
  ).toFixed(1)

  return (
    <article className="px-4 py-4 border-b">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-sm">{review.course_name}</h3>
          {review.professor_name && (
            <p className="text-xs text-muted-foreground">{review.professor_name} 先生</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-amber-500">{avgScore}</div>
          <div className="text-[10px] text-muted-foreground">総合</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        {REVIEW_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground flex-shrink-0">{label}</span>
            <StarRating value={review[key]} readonly size="sm" />
          </div>
        ))}
      </div>

      {review.review_text && (
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-lg px-3 py-2">
          {review.review_text}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
        {review.universities && <span>{review.universities.name}</span>}
        <span>{timeAgo(review.created_at)}</span>
      </div>
    </article>
  )
}
