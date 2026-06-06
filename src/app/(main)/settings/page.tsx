import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUniversities } from '@/lib/actions/user'
import { SettingsForm } from './SettingsForm'

export const metadata: Metadata = { title: '設定' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const [user, universities, { data: { user: authUser } }] = await Promise.all([
    getCurrentUser(),
    getUniversities(),
    supabase.auth.getUser(),
  ])
  if (!user) return null

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="font-bold text-lg">プロフィール設定</h1>
        <p className="text-sm text-muted-foreground">表示情報を変更できます</p>
      </div>
      <SettingsForm user={user} universities={universities} email={authUser?.email ?? ''} />

      <div className="border-t pt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Link href="/legal/terms" className="hover:text-foreground hover:underline">利用規約</Link>
        <Link href="/legal/privacy" className="hover:text-foreground hover:underline">プライバシーポリシー</Link>
        <Link href="/legal/tokushoho" className="hover:text-foreground hover:underline">特定商取引法に基づく表記</Link>
      </div>
    </div>
  )
}
