import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudyRoomMessages } from '@/lib/actions/study-rooms'
import { StudyRoomChat } from './StudyRoomChat'

export const metadata: Metadata = { title: '試験対策部屋' }

export default async function StudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { room, messages } = await getStudyRoomMessages(id)
  if (!room) notFound()

  return (
    <StudyRoomChat
      room={room as never}
      initialMessages={messages as never}
      currentUserId={user.id}
    />
  )
}
