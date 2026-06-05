import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const email = data.user.email ?? ''

      // 大学メールアドレス（.ac.jp）以外はログインを拒否
      if (!email.toLowerCase().endsWith('.ac.jp')) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/login?error=university_email_required`
        )
      }

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!existing) {
        const nickname =
          data.user.user_metadata?.full_name ||
          email.split('@')[0] ||
          '匿名ユーザー'

        await supabase.from('users').insert({
          id: data.user.id,
          nickname,
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
