import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getStudyRooms } from '@/lib/actions/study-rooms'
import { getCurrentUser } from '@/lib/actions/user'
import { Button } from '@/components/ui/button'
import { CreateRoomDialog } from './CreateRoomDialog'

export const metadata: Metadata = { title: '試験対策部屋' }

export default async function StudyRoomsPage() {
  const [rooms, user] = await Promise.all([getStudyRooms(), getCurrentUser()])

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">試験対策部屋</h1>
          <p className="text-xs text-muted-foreground mt-0.5">授業ごとに情報共有・質問ができます</p>
        </div>
        {user && <CreateRoomDialog />}
      </div>

      <div className="divide-y">
        {rooms.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground text-sm">まだ部屋がありません</p>
        ) : (
          rooms.map((room) => (
            <Link key={room.id} href={`/study-rooms/${room.id}`} className="block px-4 py-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{room.course_name}</p>
                  {room.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{room.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    作成: {(room.users as { nickname: string } | null)?.nickname ?? '不明'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
