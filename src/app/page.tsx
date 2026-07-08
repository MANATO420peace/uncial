import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutList, ShoppingBag, CalendarDays, MessageCircle } from 'lucide-react'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/home')

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="text-xl font-black tracking-tight">
          <span className="text-white">uni</span><span className="text-blue-400">can</span>
        </div>
        <Link
          href="/login"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ログイン
        </Link>
      </header>

      {/* ヒーロー */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-16">
        {/* ロゴ */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-400/30 text-blue-400 text-xs mb-2">
            大学メール限定
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            <span className="text-white">uni</span><span className="text-blue-400">can</span>
          </h1>
          <p className="text-white/50 text-sm tracking-widest uppercase">University Campus</p>
        </div>

        <p className="text-white/70 text-lg leading-relaxed max-w-xs">
          大学生だけのクローズドコミュニティ
        </p>

        {/* 機能カード */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[
            { icon: LayoutList, title: '掲示板', desc: '楽単・テスト情報を共有', color: 'text-blue-400' },
            { icon: ShoppingBag, title: 'フリマ', desc: '教科書・参考書を売買', color: 'text-orange-400' },
            { icon: CalendarDays, title: '時間割', desc: '友達と時間割をシェア', color: 'text-pink-400' },
            { icon: MessageCircle, title: 'DM', desc: '学生同士でメッセージ', color: 'text-green-400' },
          ].map(f => (
            <div
              key={f.title}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-left"
            >
              <f.icon className={`h-6 w-6 mb-2 ${f.color}`} strokeWidth={1.5} />
              <div className="text-sm font-bold text-white mb-0.5">{f.title}</div>
              <div className="text-xs text-white/40">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full max-w-sm space-y-3">
          <Link
            href="/register"
            className="block w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl text-center transition-colors"
          >
            無料で始める
          </Link>
          <Link
            href="/login"
            className="block w-full py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 font-medium rounded-2xl text-center transition-colors border border-white/[0.08]"
          >
            ログイン
          </Link>
        </div>

        <p className="text-white/30 text-xs">
          大学メール（.ac.jp）が必要です
        </p>
      </main>

      {/* フッター */}
      <footer className="px-6 py-6 text-center">
        <div className="flex justify-center gap-4 text-xs text-white/30">
          <Link href="/legal/terms" className="hover:text-white/60 transition-colors">利用規約</Link>
          <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:text-white/60 transition-colors">お問い合わせ</Link>
        </div>
      </footer>
    </div>
  )
}
