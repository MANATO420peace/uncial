import { Metadata } from 'next'
import { getTimetable, getCourseTasks } from '@/lib/actions/timetable'
import { getCurrentUser } from '@/lib/actions/user'
import { createClient } from '@/lib/supabase/server'
import { TimetableGrid } from './TimetableGrid'
import { TimetableShareButton } from './TimetableShareButton'
import { Lock } from 'lucide-react'

export const metadata: Metadata = { title: '時間割' }

interface Props {
  searchParams: Promise<{ view?: string }>
}

export default async function TimetablePage({ searchParams }: Props) {
  const { view } = await searchParams
  const currentUser = await getCurrentUser()

  const viewUserId = view ?? currentUser?.id
  const isOwn = !view || view === currentUser?.id

  // 他ユーザーの時間割を閲覧する場合、同じ大学かチェック
  if (view && view !== currentUser?.id) {
    const supabase = await createClient()
    const { data: targetUser } = await supabase
      .from('users')
      .select('nickname, university_id')
      .eq('id', view)
      .single()

    // 同じ大学でなければアクセス拒否
    if (!targetUser || targetUser.university_id !== currentUser?.university_id) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground px-4">
          <Lock className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">この時間割は表示できません</p>
          <p className="text-xs text-center">時間割は同じ大学のユーザーのみ共有できます</p>
        </div>
      )
    }

    // 同じ大学なら表示
    const [entries] = await Promise.all([getTimetable(viewUserId)])

    return (
      <div>
        <div className="px-4 py-3 border-b">
          <h1 className="font-bold text-lg">{targetUser.nickname}さんの時間割</h1>
          <p className="text-xs text-muted-foreground mt-0.5">読み取り専用</p>
        </div>
        <div className="p-2">
          <TimetableGrid entries={entries} tasks={[]} isOwn={false} />
        </div>
      </div>
    )
  }

  // 自分の時間割
  const [entries, tasks] = await Promise.all([
    getTimetable(currentUser?.id),
    getCourseTasks(),
  ])

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">時間割</h1>
          <p className="text-xs text-muted-foreground mt-0.5">セルをタップして授業を登録・編集できます</p>
        </div>
        {currentUser && (
          <TimetableShareButton userId={currentUser.id} />
        )}
      </div>
      <div className="p-2">
        <TimetableGrid entries={entries} tasks={tasks} isOwn={true} />
      </div>
    </div>
  )
}
