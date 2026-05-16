'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string
  const university_id = formData.get('university_id') as string
  const faculty = formData.get('faculty') as string
  const grade = formData.get('grade') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, university_id, faculty, grade },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // メール確認が必要な場合（session が null）
  if (!data.session) {
    return { needsConfirmation: true }
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      nickname,
      university_id: university_id || null,
      faculty: faculty || null,
      grade: grade || null,
      terms_agreed_at: new Date().toISOString(),
    })

    if (profileError && !profileError.message.includes('duplicate')) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // ログイン成功時にプロフィールがなければ作成
  if (data.user) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!existing) {
      const nickname = data.user.user_metadata?.nickname ||
        data.user.email?.split('@')[0] || 'ユーザー'
      await supabase.from('users').insert({
        id: data.user.id,
        nickname,
        university_id: data.user.user_metadata?.university_id || null,
        faculty: data.user.user_metadata?.faculty || null,
        grade: data.user.user_metadata?.grade || null,
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uncial-2026.vercel.app'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) return { error: error.message }
  return { error: null }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
