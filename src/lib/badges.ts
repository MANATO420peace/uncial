export const BADGE_THRESHOLDS = [
  { id: 'newcomer', label: '新入生', points: 0 },
  { id: 'active', label: 'アクティブ', points: 50 },
  { id: 'contributor', label: '貢献者', points: 200 },
  { id: 'expert', label: 'エキスパート', points: 500 },
  { id: 'legend', label: 'レジェンド', points: 1000 },
]

export function getBadgeForPoints(points: number) {
  return [...BADGE_THRESHOLDS].reverse().find(b => points >= b.points) ?? BADGE_THRESHOLDS[0]
}
