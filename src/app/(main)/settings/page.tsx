import { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Bookmark, ChevronRight } from 'lucide-react'
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

      {/* アクセシビリティ */}
      <div className="border-t pt-6 space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">アクティビティ</h2>
        <Link
          href="/settings/liked"
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">いいねした投稿</p>
            <p className="text-xs text-muted-foreground">自分がいいねした投稿を確認</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/settings/bookmarks"
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Bookmark className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">保存した投稿</p>
            <p className="text-xs text-muted-foreground">ブックマークした投稿を確認</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <div className="border-t pt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Link href="/legal/terms" className="hover:text-foreground hover:underline">利用規約</Link>
        <Link href="/legal/privacy" className="hover:text-foreground hover:underline">プライバシーポリシー</Link>
        <Link href="/legal/tokushoho" className="hover:text-foreground hover:underline">特定商取引法に基づく表記</Link>
      </div>
    </div>
  )
}
