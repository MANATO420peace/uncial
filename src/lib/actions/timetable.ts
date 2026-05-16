'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getTimetable(userId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const targetId = userId ?? user?.id
  if (!targetId) return []

  const { data } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('user_id', targetId)
    .order('day_of_week')
    .order('period')

  return data ?? []
}

export async function upsertTimetableEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const day_of_week = Number(formData.get('day_of_week'))
  const period = Number(formData.get('period'))
  const course_name = formData.get('course_name') as string
  const professor_name = (formData.get('professor_name') as string) || null
  const room = (formData.get('room') as string) || null

  if (!course_name.trim()) return { error: '授業名を入力してください' }

  const { error } = await supabase.from('timetable_entries').upsert({
    user_id: user.id,
    day_of_week,
    period,
    course_name,
    professor_name,
    room,
  }, { onConflict: 'user_id,day_of_week,period' })

  if (error) return { error: error.message }
  revalidatePath('/timetable')
  return { error: null }
}

export async function deleteTimetableEntry(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  await supabase.from('timetable_entries').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/timetable')
  return { error: null }
}

export async function getCourseTasks(userId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const targetId = userId ?? user?.id
  if (!targetId) return []

  const { data } = await supabase
    .from('course_tasks')
    .select('*')
    .eq('user_id', targetId)
    .order('created_at')

  return data ?? []
}

export async function addCourseTask(entryId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase.from('course_tasks').insert({
    user_id: user.id,
    timetable_entry_id: entryId,
    content: content.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/timetable')
  return { error: null }
}

export async function toggleCourseTask(taskId: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('course_tasks').update({ is_completed: completed }).eq('id', taskId).eq('user_id', user.id)
  revalidatePath('/timetable')
}

export async function deleteCourseTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('course_tasks').delete().eq('id', taskId).eq('user_id', user.id)
  revalidatePath('/timetable')
}

export async function findUsersWithSameCourse(courseName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('timetable_entries')
    .select('users(id, nickname, avatar_url, universities(name))')
    .ilike('course_name', `%${courseName}%`)
    .neq('user_id', user?.id ?? '')
    .limit(20)

  return data?.map(d => d.users).filter(Boolean) ?? []
}
