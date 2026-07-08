'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── スライドデータ ──────────────────────────────────────────
const SLIDES = [
  {
    id: 'welcome',
    accentColor: '#3b82f6',
    activeColor: '#63b3ed',
    glowFrom: '#3b82f6',
    glowTo: '#8b5cf6',
    title: 'unicanへようこそ',
    desc: '大学メール（.ac.jp）で登録した学生だけが使えるクローズドコミュニティです。',
  },
  {
    id: 'board',
    accentColor: '#10b981',
    activeColor: '#34d399',
    glowFrom: '#10b981',
    glowTo: '#14b8a6',
    title: '掲示板で情報交換',
    desc: '楽単・テスト情報・サークルなど、同じ大学の学生と気軽に情報交換できます。',
  },
  {
    id: 'flea',
    accentColor: '#f97316',
    activeColor: '#fb923c',
    glowFrom: '#f97316',
    glowTo: '#f59e0b',
    title: 'フリマで教科書を売買',
    desc: '同じ大学の学生同士で教科書・参考書・不用品を売買できます。',
  },
  {
    id: 'timetable',
    accentColor: '#ec4899',
    activeColor: '#f472b6',
    glowFrom: '#ec4899',
    glowTo: '#f43f5e',
    title: '時間割をシェア',
    desc: '自分の時間割を登録して同じ大学の友達と共有できます。',
  },
]

// ── モックアップ: スライド1 ──────────────────────────────────
function WelcomeMockup() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: 'linear-gradient(160deg, #0d1b2e 0%, #0a0a0f 100%)' }}>
      <div className="text-3xl font-black tracking-tight" style={{ letterSpacing: '-1px' }}>
        <span className="text-white">uni</span><span style={{ color: '#63b3ed' }}>can</span>
      </div>
      <div className="text-[10px] tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
        University Campus
      </div>
      <div className="mt-1 px-3 py-1 rounded-full text-[10px]"
        style={{ border: '1px solid rgba(99,179,237,0.3)', color: '#63b3ed' }}>
        大学メール限定
      </div>
      <div className="flex gap-1.5 mt-2">
        {[true, false, false, false, false, false].map((on, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: on ? '#63b3ed' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
    </div>
  )
}

// ── モックアップ: スライド2 ──────────────────────────────────
function BoardMockup() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0d0d14' }}>
      {/* ヘッダー */}
      <div className="flex items-center px-3 py-2.5 gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[12px] font-bold text-white flex-1">掲示板</span>
        <div className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 9l1.5-3.5L8 1.5 8.5 2 3.5 7.5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      {/* タブ */}
      <div className="flex px-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-3 py-1.5 text-[10px]" style={{ color: '#63b3ed', borderBottom: '2px solid #63b3ed' }}>みんなの投稿</div>
        <div className="px-3 py-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>フォロー中</div>
      </div>
      {/* カテゴリ */}
      <div className="flex gap-1.5 px-3 py-2 overflow-hidden">
        {['すべて', '楽単情報', 'テスト対策', 'サークル'].map((cat, i) => (
          <div key={cat} className="px-2 py-0.5 rounded-full text-[9px] whitespace-nowrap"
            style={i === 0
              ? { background: 'rgba(99,179,237,0.15)', color: '#63b3ed' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
            {cat}
          </div>
        ))}
      </div>
      {/* 投稿 */}
      {[
        { tag: '楽単情報', title: 'データサイエンス入門、出席さえすれば余裕でした', meta: '12分前 · コメント 8 · いいね 24' },
        { tag: 'テスト対策', title: '経営学のテスト、昨年の過去問ほぼそのまま出た', meta: '1時間前 · コメント 3 · いいね 11' },
      ].map(p => (
        <div key={p.tag} className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[8px] mb-0.5" style={{ color: '#63b3ed' }}>{p.tag}</div>
          <div className="text-[10px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>{p.title}</div>
          <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{p.meta}</div>
        </div>
      ))}
    </div>
  )
}

// ── モックアップ: スライド3 ──────────────────────────────────
function FleaMockup() {
  const items = [
    {
      name: '基礎化学 改訂版', price: '¥800', badge: '経済学部 3年',
      bg: 'linear-gradient(160deg,#0d2010,#0a1a0d)',
      svg: (
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
          <rect x="5" y="2" width="24" height="40" rx="3" fill="#1a4a1a"/>
          <rect x="5" y="2" width="5" height="40" rx="2" fill="#22c55e" opacity="0.8"/>
          <rect x="12" y="10" width="13" height="1.5" rx="1" fill="#4ade80" opacity="0.6"/>
          <rect x="12" y="14" width="10" height="1.5" rx="1" fill="#4ade80" opacity="0.4"/>
          <rect x="12" y="18" width="12" height="1.5" rx="1" fill="#4ade80" opacity="0.4"/>
          <rect x="12" y="22" width="8" height="1.5" rx="1" fill="#4ade80" opacity="0.3"/>
          <rect x="5" y="2" width="24" height="40" rx="3" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.4"/>
        </svg>
      ),
    },
    {
      name: '統計学テキスト', price: '¥1,200', badge: '理工学部 2年',
      bg: 'linear-gradient(160deg,#0d1a2e,#080f1c)',
      svg: (
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
          <rect x="5" y="2" width="24" height="40" rx="3" fill="#1a2d4a"/>
          <rect x="5" y="2" width="5" height="40" rx="2" fill="#3b82f6" opacity="0.8"/>
          <rect x="12" y="10" width="13" height="1.5" rx="1" fill="#93c5fd" opacity="0.6"/>
          <rect x="12" y="14" width="9" height="1.5" rx="1" fill="#93c5fd" opacity="0.4"/>
          <rect x="12" y="18" width="11" height="1.5" rx="1" fill="#93c5fd" opacity="0.4"/>
          <rect x="12" y="22" width="7" height="1.5" rx="1" fill="#93c5fd" opacity="0.3"/>
          <rect x="12" y="26" width="10" height="1.5" rx="1" fill="#93c5fd" opacity="0.3"/>
          <rect x="5" y="2" width="24" height="40" rx="3" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.4"/>
        </svg>
      ),
    },
    {
      name: '英語リーディング', price: '¥500', badge: '文学部 1年',
      bg: 'linear-gradient(160deg,#1e1000,#150c00)',
      svg: (
        <svg width="38" height="44" viewBox="0 0 38 44" fill="none">
          <rect x="7" y="3" width="24" height="38" rx="2" fill="#292000"/>
          <rect x="7" y="3" width="24" height="38" rx="2" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.5"/>
          {[9,16,23,30,37].map(cy => (
            <circle key={cy} cx="7" cy={cy} r="2" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.7"/>
          ))}
          {[12,17,22,27,32].map((y,i) => (
            <rect key={y} x="12" y={y} width={[14,16,12,15,11][i]} height="1" rx="0.5" fill="#f97316" opacity="0.3"/>
          ))}
        </svg>
      ),
    },
    {
      name: '製図セット', price: '¥2,000', badge: '工学部 4年',
      bg: 'linear-gradient(160deg,#150d2e,#0d0820)',
      svg: (
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
          <rect x="5" y="2" width="24" height="40" rx="4" fill="#1e1040"/>
          <rect x="5" y="2" width="24" height="40" rx="4" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.5"/>
          <rect x="9" y="6" width="16" height="10" rx="2" fill="#2d1a60"/>
          <rect x="11" y="9" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.8"/>
          <rect x="15" y="12" width="6" height="1.5" rx="0.75" fill="#a78bfa" opacity="0.5"/>
          {[[9,20],[15,20],[9,26],[15,26]].map(([x,y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
          ))}
          {[[21,20],[21,26]].map(([x,y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="#7c3aed" opacity="0.6"/>
          ))}
          <rect x="9" y="32" width="10" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
          <rect x="21" y="32" width="4" height="4" rx="1" fill="#7c3aed" opacity="0.6"/>
        </svg>
      ),
    },
  ]
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0d0d14' }}>
      <div className="px-3 py-2.5 text-[12px] font-bold text-white"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>フリマ</div>
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {items.map(item => (
          <div key={item.name} className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-12 flex items-center justify-center" style={{ background: item.bg }}>
              {item.svg}
            </div>
            <div className="p-1.5">
              <div className="text-[9px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.name}</div>
              <div className="text-[10px] font-bold" style={{ color: '#f6ad55' }}>{item.price}</div>
              <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.badge}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── モックアップ: スライド4 ──────────────────────────────────
function TimetableMockup() {
  const days = ['月', '火', '水', '木', '金']
  const grid = [
    [{ bg: 'rgba(99,179,237,0.25)', color: '#90cdf4', label: '英語基礎' }, null, { bg: 'rgba(52,211,153,0.2)', color: '#6ee7b7', label: '線形代数' }, null, null],
    [null, { bg: 'rgba(249,115,22,0.2)', color: '#fb923c', label: '経営学' }, null, null, { bg: 'rgba(236,72,153,0.2)', color: '#f472b6', label: '社会学' }],
    [{ bg: 'rgba(168,85,247,0.2)', color: '#c084fc', label: '情報処理' }, null, null, { bg: 'rgba(245,158,11,0.2)', color: '#fcd34d', label: '心理学' }, null],
    [null, { bg: 'rgba(20,184,166,0.2)', color: '#5eead4', label: '統計学' }, null, null, { bg: 'rgba(244,63,94,0.2)', color: '#fb7185', label: '哲学' }],
  ]
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0d0d14' }}>
      <div className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[12px] font-bold text-white">時間割</span>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>前期 2026</span>
      </div>
      <div className="flex-1 grid p-1.5 gap-0.5"
        style={{ gridTemplateColumns: '22px repeat(5, 1fr)', fontSize: '8px' }}>
        {/* ヘッダー */}
        <div />
        {days.map(d => (
          <div key={d} className="text-center py-1" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{d}</div>
        ))}
        {/* 行 */}
        {grid.map((row, ri) => (
          <>
            <div key={`p${ri}`} className="text-right pr-1 pt-1.5"
              style={{ color: 'rgba(255,255,255,0.2)', fontSize: '8px' }}>{ri + 1}</div>
            {row.map((cell, ci) => (
              <div key={ci} className="rounded flex items-center justify-center text-center font-semibold"
                style={{
                  minHeight: '26px',
                  fontSize: '7.5px',
                  lineHeight: '1.2',
                  background: cell ? cell.bg : 'rgba(255,255,255,0.02)',
                  color: cell ? cell.color : 'transparent',
                }}>
                {cell?.label ?? ''}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  )
}

const MOCKUPS = [WelcomeMockup, BoardMockup, FleaMockup, TimetableMockup]

// ── メインページ ─────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const slide = SLIDES[current]
  const Mockup = MOCKUPS[current]
  const isLast = current === SLIDES.length - 1

  function next() {
    if (isLast) router.push('/register')
    else setCurrent(c => c + 1)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < SLIDES.length - 1) setCurrent(c => c + 1)
      if (diff < 0 && current > 0) setCurrent(c => c - 1)
    }
    touchStartX.current = null
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0f', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── ヘッダー ── */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <div className="text-xl font-black" style={{ letterSpacing: '-0.5px' }}>
          <span className="text-white">uni</span>
          <span style={{ color: '#63b3ed' }}>can</span>
        </div>
        <Link href="/login" className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          ログイン
        </Link>
      </header>

      {/* ── スライドカード ── */}
      <main className="flex-1 flex flex-col w-full px-4 pb-4" style={{ minHeight: 0 }}>
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
          {/* カード */}
          <div className="flex-1 flex flex-col relative rounded-[28px] overflow-hidden"
            style={{
              background: '#0d0d14',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}>
            {/* グロー */}
            <div className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${slide.glowFrom}, ${slide.glowTo})`,
                opacity: 0.15,
              }} />

            {/* モックアップ */}
            <div className="relative flex-1 mx-5 mt-6 rounded-2xl overflow-hidden"
              style={{
                minHeight: '200px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#111118',
              }}>
              <Mockup />
            </div>

            {/* テキスト + ドット + ボタン */}
            <div className="relative px-6 pt-5 pb-6 text-center">
              <h2 className="text-[18px] font-bold text-white mb-2" style={{ letterSpacing: '-0.3px' }}>
                {slide.title}
              </h2>
              <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {slide.desc}
              </p>

              {/* ドット */}
              <div className="flex justify-center items-center gap-1.5 mb-5">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className="rounded-full transition-all"
                    style={{
                      height: '5px',
                      width: i === current ? '18px' : '5px',
                      background: i === current ? slide.activeColor : 'rgba(255,255,255,0.15)',
                    }} />
                ))}
              </div>

              {/* ボタン */}
              <div className="flex gap-2.5">
                {!isLast && (
                  <button onClick={() => setCurrent(SLIDES.length - 1)}
                    className="flex-1 py-2.5 text-[13px] transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                    スキップ
                  </button>
                )}
                <button
                  onClick={next}
                  className="font-bold text-white rounded-xl transition-opacity hover:opacity-90 active:opacity-75"
                  style={{
                    flex: isLast ? 'none' : '1',
                    width: isLast ? '100%' : undefined,
                    height: '44px',
                    background: slide.accentColor,
                    fontSize: '14px',
                  }}>
                  {isLast ? 'はじめる' : '次へ →'}
                </button>
              </div>
            </div>
          </div>

          {/* ログインリンク（最終スライド） */}
          {isLast && (
            <p className="text-center mt-3 text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              アカウントをお持ちの方は{' '}
              <Link href="/login" className="underline underline-offset-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                ログイン
              </Link>
            </p>
          )}
        </div>
      </main>

      {/* ── フッター ── */}
      <footer className="w-full px-6 py-5 text-center">
        <div className="flex justify-center gap-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <Link href="/legal/terms" className="hover:text-white/50 transition-colors">利用規約</Link>
          <Link href="/legal/privacy" className="hover:text-white/50 transition-colors">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:text-white/50 transition-colors">お問い合わせ</Link>
        </div>
      </footer>
    </div>
  )
}
