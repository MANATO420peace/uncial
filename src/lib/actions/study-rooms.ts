'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getStudyRooms(universityId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('study_rooms')
    .select('*, users!created_by(id, nickname)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (universityId) query = query.eq('university_id', universityId)

  const { data } = await query
  return data ?? []
}

export async function createStudyRoom(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: profile } = await supabase.from('users').select('university_id').eq('id', user.id).single()

  const { data, error } = await supabase.from('study_rooms').insert({
    course_name: formData.get('course_name') as string,
    description: (formData.get('description') as string) || null,
    university_id: profile?.university_id ?? null,
    created_by: user.id,
  }).select('id').single()

  if (error) return { error: error.message }
  revalidatePath('/study-rooms')
  redirect(`/study-rooms/${data.id}`)
}

export async function getStudyRoomMessages(roomId: string) {
  const supabase = await createClient()

  const [{ data: room }, { data: messages }] = await Promise.all([
    supabase.from('study_rooms').select('*, users!created_by(id, nickname)').eq('id', roomId).single(),
    supabase
      .from('study_room_messages')
      .select('*, users(id, nickname, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100),
  ])

  return { room, messages: messages ?? [] }
}

export async function sendStudyRoomMessage(roomId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (!content.trim()) return { error: 'メッセージを入力してください' }

  const { error } = await supabase.from('study_room_messages').insert({
    room_id: roomId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath(`/study-rooms/${roomId}`)
  return { error: null }
}
