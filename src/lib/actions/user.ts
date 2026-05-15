'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getUniversities() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('universities')
    .select('*')
    .order('name')
  return data ?? []
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*, universities(id, name)')
    .eq('id', user.id)
    .single()

  return data
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const avatarUrl = formData.get('avatar_url') as string | null
  const isPrivate = formData.get('is_private') === 'true'

  const { error } = await supabase
    .from('users')
    .update({
      nickname: formData.get('nickname') as string,
      university_id: (formData.get('university_id') as string) || null,
      faculty: (formData.get('faculty') as string) || null,
      grade: (formData.get('grade') as string) || null,
      is_private: isPrivate,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/settings')
  return { error: null }
}
