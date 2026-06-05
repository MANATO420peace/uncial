import { getBadgeProgress, BADGE_THRESHOLDS } from '@/lib/badges'

interface Props {
  points: number
}

export function BadgeProgress({ points }: Props) {
  const { current, next, percent } = getBadgeProgress(points)

  return (
    <div className="mt-3 space-y-2">
      {/* バッジ一覧 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {BADGE_THRESHOLDS.map((badge) => {
          const unlocked = points >= badge.points
          return (
            <span
              key={badge.id}
              title={`${badge.label}（${badge.points}pt〜）`}
              className={`text-lg transition-all ${unlocked ? 'opacity-100' : 'opacity-20 grayscale'}`}
            >
              {badge.emoji}
            </span>
          )
        })}
      </div>

      {/* 現在のバッジと次のバッジまでの進捗 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{current.emoji} {current.label}</span>
          {next ? (
            <span>{next.emoji} {next.label} まで {next.points - points}pt</span>
          ) : (
            <span className="text-primary font-medium">最高ランク達成 🎉</span>
          )}
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
