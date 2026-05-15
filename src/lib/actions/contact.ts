'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function submitContact(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const category = formData.get('category') as string
  const message = formData.get('message') as string

  if (!name.trim() || !email.trim() || !message.trim()) {
    return { error: '必須項目を入力してください' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error: dbError } = await supabase.from('contact_messages').insert({
    user_id: user?.id ?? null,
    name,
    email,
    category,
    message,
  })

  if (dbError) return { error: 'データの保存に失敗しました' }

  const resendApiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.CONTACT_EMAIL

  if (resendApiKey && adminEmail) {
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: 'ユニキャン <onboarding@resend.dev>',
      to: adminEmail,
      subject: `【お問い合わせ】${category} - ${name}`,
      text: `
名前: ${name}
メール: ${email}
カテゴリ: ${category}

内容:
${message}
      `.trim(),
    })
  }

  return { error: null }
}
