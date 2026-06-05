import { Metadata } from 'next'
import { getTimetable, getCourseTasks } from '@/lib/actions/timetable'
import { getCurrentUser } from '@/lib/actions/user'
import { createClient } from '@/lib/supabase/server'
import { TimetableGrid } from './TimetableGrid'
import { TimetableShareButton } from './TimetableShareButton'

export const metadata: Metadata = { title: '時間割' }

interface Props {
  searchParams: Promise<{ view?: string }>
}

export default async function TimetablePage({ searchParams }: Props) {
  const { view } = await searchParams
  const currentUser = await getCurrentUser()

  // ?view=[userId] で他のユーザーの時間割を読み取り専用で表示
  const viewUserId = view ?? currentUser?.id
  const isOwn = !view || view === currentUser?.id

  const [entries, tasks] = await Promise.all([
    getTimetable(viewUserId),
    isOwn ? getCourseTasks() : Promise.resolve([]),
  ])

  // 閲覧対象のユーザー名を取得（他ユーザー閲覧時のみ）
  let viewUserName: string | null = null
  if (view && view !== currentUser?.id) {
    const supabase = await createClient()
    const { data } = await supabase.from('users').select('nickname').eq('id', view).single()
    viewUserName = data?.nickname ?? null
  }

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">
            {viewUserName ? `${viewUserName}さんの時間割` : '時間割'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOwn ? 'セルをタップして授業を登録・編集できます' : '読み取り専用'}
          </p>
        </div>
        {isOwn && currentUser && (
          <TimetableShareButton userId={currentUser.id} />
        )}
      </div>
      <div className="p-2">
        <TimetableGrid entries={entries} tasks={tasks} isOwn={isOwn} />
      </div>
    </div>
  )
}
