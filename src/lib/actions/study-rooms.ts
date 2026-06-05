'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getStudyRooms(universityId?: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('study_rooms')
    .select('*, users!created_by(id, nickname)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (universityId) query = query.eq('university_id', universityId)
  if (search) query = query.ilike('course_name', `%${search}%`)

  const { data: rooms } = await query
  if (!rooms || rooms.length === 0) return []

  // 各ルームの最新メッセージとメッセージ数を取得
  const roomIds = rooms.map(r => r.id)

  const { data: lastMsgs } = await supabase
    .from('study_room_messages')
    .select('room_id, content, created_at, users(nickname)')
    .in('room_id', roomIds)
    .order('created_at', { ascending: false })

  const { data: msgCounts } = await supabase
    .from('study_room_messages')
    .select('room_id')
    .in('room_id', roomIds)

  // 最新メッセージをroomIdでマップ
  const lastMsgMap = new Map<string, { content: string; created_at: string; nickname: string }>()
  lastMsgs?.forEach(m => {
    if (!lastMsgMap.has(m.room_id)) {
      lastMsgMap.set(m.room_id, {
        content: m.content,
        created_at: m.created_at,
        nickname: (m.users as { nickname: string } | null)?.nickname ?? '不明',
      })
    }
  })

  // メッセージ数カウント
  const countMap = new Map<string, number>()
  msgCounts?.forEach(m => {
    countMap.set(m.room_id, (countMap.get(m.room_id) ?? 0) + 1)
  })

  return rooms.map(r => ({
    ...r,
    last_message: lastMsgMap.get(r.id) ?? null,
    message_count: countMap.get(r.id) ?? 0,
  }))
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

export async function deleteStudyRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('study_rooms')
    .delete()
    .eq('id', roomId)
    .eq('created_by', user.id)

  if (error) return { error: error.message }
  revalidatePath('/study-rooms')
  return { error: null }
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
