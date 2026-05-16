import { Metadata } from 'next'
import { getTimetable } from '@/lib/actions/timetable'
import { getCurrentUser } from '@/lib/actions/user'
import { TimetableGrid } from './TimetableGrid'

export const metadata: Metadata = { title: '時間割' }

export default async function TimetablePage() {
  const [user, entries] = await Promise.all([getCurrentUser(), getTimetable()])

  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-lg">時間割</h1>
        <p className="text-xs text-muted-foreground mt-0.5">セルをタップして授業を登録・編集。👥アイコンで同じ授業の人を探せます</p>
      </div>
      <div className="p-2">
        <TimetableGrid entries={entries} isOwn={!!user} />
      </div>
    </div>
  )
}
