import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, MessageSquare } from 'lucide-react'
import { getStudyRooms } from '@/lib/actions/study-rooms'
import { getCurrentUser } from '@/lib/actions/user'
import { CreateRoomDialog } from './CreateRoomDialog'
import { StudyRoomSearch } from './StudyRoomSearch'
import { timeAgo } from '@/lib/utils'

export const metadata: Metadata = { title: '試験対策部屋' }

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function StudyRoomsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const [allRooms, user] = await Promise.all([
    getStudyRooms(undefined, q),
    getCurrentUser(),
  ])

  // 自分の大学のルームを上に表示
  const myUniversityId = (user as { university_id?: string | null } | null)?.university_id
  const myRooms = myUniversityId ? allRooms.filter(r => r.university_id === myUniversityId) : []
  const otherRooms = myUniversityId ? allRooms.filter(r => r.university_id !== myUniversityId) : allRooms

  const RoomItem = ({ room }: { room: typeof allRooms[0] }) => (
    <Link
      href={`/study-rooms/${room.id}`}
      className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors"
    >
      {/* アイコン */}
      <div className="shrink-0 h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm truncate">{room.course_name}</p>
          {room.last_message && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {timeAgo(room.last_message.created_at)}
            </span>
          )}
        </div>
        {room.last_message ? (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            <span className="font-medium">{room.last_message.nickname}</span>: {room.last_message.content}
          </p>
        ) : room.description ? (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{room.description}</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">まだメッセージがありません</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {(room.universities as { name: string } | null)?.name && (
            <span className="text-[10px] text-muted-foreground">
              {(room.universities as { name: string }).name}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {room.message_count}
          </span>
        </div>
      </div>
    </Link>
  )

  return (
    <div>
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">試験対策部屋</h1>
          <p className="text-xs text-muted-foreground mt-0.5">授業ごとに情報共有・質問ができます</p>
        </div>
        {user && <CreateRoomDialog />}
      </div>

      {/* 検索 */}
      <StudyRoomSearch defaultValue={q} />

      {allRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <BookOpen className="h-12 w-12 opacity-30" />
          <p className="text-sm">{q ? `「${q}」の検索結果がありません` : 'まだ部屋がありません'}</p>
          {!q && <p className="text-xs">右上のボタンから部屋を作りましょう</p>}
        </div>
      ) : (
        <div className="divide-y">
          {/* 自分の大学のルーム */}
          {myRooms.length > 0 && (
            <>
              <div className="px-4 py-2 bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground">自分の大学</p>
              </div>
              {myRooms.map(room => <RoomItem key={room.id} room={room} />)}
            </>
          )}

          {/* その他のルーム */}
          {otherRooms.length > 0 && (
            <>
              {myRooms.length > 0 && (
                <div className="px-4 py-2 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground">その他の大学</p>
                </div>
              )}
              {otherRooms.map(room => <RoomItem key={room.id} room={room} />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
