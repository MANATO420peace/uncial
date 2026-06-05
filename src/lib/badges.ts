export const BADGE_THRESHOLDS = [
  { id: 'newcomer',     emoji: '🌱', label: '新入生',        points: 0    },
  { id: 'follower',     emoji: '🤝', label: 'フレンド',      points: 30   },
  { id: 'active',       emoji: '⚡', label: 'アクティブ',    points: 100  },
  { id: 'contributor',  emoji: '🌟', label: '貢献者',        points: 300  },
  { id: 'expert',       emoji: '💎', label: 'エキスパート',  points: 700  },
  { id: 'influencer',   emoji: '🔥', label: 'インフルエンサー', points: 1500 },
  { id: 'legend',       emoji: '👑', label: 'レジェンド',    points: 3000 },
]

export type Badge = typeof BADGE_THRESHOLDS[number]

export function getBadgeForPoints(points: number): Badge {
  return [...BADGE_THRESHOLDS].reverse().find(b => points >= b.points) ?? BADGE_THRESHOLDS[0]
}

export function getNextBadge(points: number): Badge | null {
  return BADGE_THRESHOLDS.find(b => b.points > points) ?? null
}

export function getBadgeProgress(points: number): { current: Badge; next: Badge | null; percent: number } {
  const current = getBadgeForPoints(points)
  const next = getNextBadge(points)
  if (!next) return { current, next: null, percent: 100 }
  const range = next.points - current.points
  const earned = points - current.points
  const percent = Math.min(100, Math.round((earned / range) * 100))
  return { current, next, percent }
}
