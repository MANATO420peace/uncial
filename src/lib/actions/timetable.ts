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
  if (!user) return []

  // 自分の大学IDを取得して同じ大学内のみに絞る
  const { data: profile } = await supabase
    .from('users')
    .select('university_id')
    .eq('id', user.id)
    .single()

  const query = supabase
    .from('timetable_entries')
    .select('users!inner(id, nickname, avatar_url, university_id, universities(name))')
    .ilike('course_name', `%${courseName}%`)
    .neq('user_id', user.id)
    .limit(20)

  // 同じ大学のユーザーのみ
  if (profile?.university_id) {
    query.eq('users.university_id', profile.university_id)
  }

  const { data } = await query
  return data?.map(d => d.users).filter(Boolean) ?? []
}

// 同じ曜日・時限に授業を登録しているユーザーを検索（大学内のみ）
export async function findUsersBySlot(dayOfWeek: number, period: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('users')
    .select('university_id')
    .eq('id', user.id)
    .single()

  if (!profile?.university_id) return []

  // 自分の同じコマの授業名を取得
  const { data: myEntry } = await supabase
    .from('timetable_entries')
    .select('course_name')
    .eq('user_id', user.id)
    .eq('day_of_week', dayOfWeek)
    .eq('period', period)
    .maybeSingle()

  // 同じ時限に授業を持つ同大学の他ユーザーを取得
  const { data } = await supabase
    .from('timetable_entries')
    .select('course_name, users!inner(id, nickname, avatar_url, university_id, universities(name))')
    .eq('day_of_week', dayOfWeek)
    .eq('period', period)
    .neq('user_id', user.id)
    .eq('users.university_id', profile.university_id)
    .limit(20)

  return (data ?? []).map(d => ({
    ...(d.users as { id: string; nickname: string; avatar_url: string | null; universities: { name: string } | null }),
    course_name: d.course_name,
    is_same_course: myEntry
      ? d.course_name.includes(myEntry.course_name.slice(0, 4)) ||
        myEntry.course_name.includes(d.course_name.slice(0, 4))
      : false,
  })).filter(u => u.id)
}
