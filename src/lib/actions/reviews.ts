'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: profile } = await supabase
    .from('users')
    .select('university_id')
    .eq('id', user.id)
    .single()

  if (!profile?.university_id) {
    return { error: 'プロフィールで大学を設定してください' }
  }

  const { error } = await supabase.from('course_reviews').insert({
    user_id: user.id,
    university_id: profile.university_id,
    course_name: formData.get('course_name') as string,
    professor_name: (formData.get('professor_name') as string) || null,
    difficulty: parseInt(formData.get('difficulty') as string),
    attendance: parseInt(formData.get('attendance') as string),
    report_amount: parseInt(formData.get('report_amount') as string),
    test_difficulty: parseInt(formData.get('test_difficulty') as string),
    recommendation: parseInt(formData.get('recommendation') as string),
    review_text: (formData.get('review_text') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/reviews')
  return { error: null }
}

export async function getReviews(universityId?: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('course_reviews')
    .select('*, universities(id, name)')
    .order('created_at', { ascending: false })

  if (universityId) {
    query = query.eq('university_id', universityId)
  }
  if (search) {
    query = query.or(`course_name.ilike.%${search}%,professor_name.ilike.%${search}%`)
  }

  query = query.limit(50)

  const { data, error } = await query
  if (error) return { reviews: [], error: error.message }
  return { reviews: data ?? [], error: null }
}
