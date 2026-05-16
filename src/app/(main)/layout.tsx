import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // メールアドレス未確認のEmailユーザーはverify-emailへ
  const isEmailProvider = (user.app_metadata?.provider ?? 'email') === 'email'
  if (isEmailProvider && !user.email_confirmed_at) {
    redirect('/verify-email')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*, universities(id, name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={profile} />
      <main className="flex-1 max-w-2xl mx-auto w-full pb-20 pt-2">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
