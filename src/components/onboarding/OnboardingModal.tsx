'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'unican_onboarding_done'

/* ── ミニモックアップ ── */

function WelcomeMockup() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3
      bg-gradient-to-b from-[#0d1b2e] to-[#0a0a0f]">
      <div className="text-3xl font-black tracking-tight leading-none">
        <span className="text-white">uni</span>
        <span className="text-[#63b3ed]">can</span>
      </div>
      <div className="text-[9px] tracking-[3px] text-white/30 uppercase">University Campus</div>
      <div className="px-3 py-1 rounded-full border border-[#63b3ed]/30 text-[#63b3ed] text-[10px]">
        🎓 大学メール限定
      </div>
      <div className="flex gap-1.5 mt-1">
        {[true,false,false,false,false,false].map((on, i) => (
          <div key={i} className={`h-1 rounded-full ${on ? 'w-4 bg-[#63b3ed]' : 'w-1 bg-white/15'}`} />
        ))}
      </div>
    </div>
  )
}

function BoardMockup() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d14] text-white">
      {/* header */}
      <div className="flex items-center px-3 py-2 border-b border-white/5">
        <span className="text-[11px] font-bold flex-1">掲示板</span>
        <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[9px]">✏️</div>
      </div>
      {/* tabs */}
      <div className="flex border-b border-white/5 text-[9px]">
        <div className="px-3 py-1.5 text-[#63b3ed] border-b border-[#63b3ed]">みんなの投稿</div>
        <div className="px-3 py-1.5 text-white/30">フォロー中</div>
      </div>
      {/* cats */}
      <div className="flex gap-1.5 px-3 py-1.5 overflow-hidden">
        {['すべて','楽単情報','テスト対策','サークル'].map((c,i) => (
          <div key={c} className={`px-2 py-0.5 rounded-full text-[8px] whitespace-nowrap
            ${i===0 ? 'bg-[#63b3ed]/15 text-[#63b3ed]' : 'bg-white/5 text-white/30'}`}>
            {c}
          </div>
        ))}
      </div>
      {/* posts */}
      {[
        { tag:'楽単情報', title:'データサイエンス入門、出席さえすれば余裕でした', meta:'12分前 · 💬 8 · ❤️ 24' },
        { tag:'テスト対策', title:'経営学のテスト、昨年の過去問ほぼそのまま出た', meta:'1時間前 · 💬 3 · ❤️ 11' },
      ].map((p) => (
        <div key={p.tag} className="px-3 py-2 border-b border-white/[0.03]">
          <div className="text-[8px] text-[#63b3ed] mb-0.5">{p.tag}</div>
          <div className="text-[9px] font-semibold text-white/85 mb-0.5 leading-tight">{p.title}</div>
          <div className="text-[7.5px] text-white/25">{p.meta}</div>
        </div>
      ))}
    </div>
  )
}

function FleaMockup() {
  const items = [
    {
      name:'基礎化学 改訂版', price:'¥800', sub:'経済学部 3年',
      bg:'linear-gradient(160deg,#0d2010,#0a1a0d)',
      svg: <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
        <rect x="5" y="2" width="24" height="40" rx="3" fill="#1a4a1a"/>
        <rect x="5" y="2" width="5" height="40" rx="2" fill="#22c55e" opacity="0.8"/>
        <rect x="12" y="10" width="13" height="1.5" rx="1" fill="#4ade80" opacity="0.6"/>
        <rect x="12" y="14" width="10" height="1.5" rx="1" fill="#4ade80" opacity="0.4"/>
        <rect x="12" y="18" width="12" height="1.5" rx="1" fill="#4ade80" opacity="0.4"/>
        <rect x="12" y="22" width="8"  height="1.5" rx="1" fill="#4ade80" opacity="0.3"/>
        <rect x="5" y="2" width="24" height="40" rx="3" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.4"/>
      </svg>,
    },
    {
      name:'統計学テキスト', price:'¥1,200', sub:'理工学部 2年',
      bg:'linear-gradient(160deg,#0d1a2e,#080f1c)',
      svg: <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
        <rect x="5" y="2" width="24" height="40" rx="3" fill="#1a2d4a"/>
        <rect x="5" y="2" width="5" height="40" rx="2" fill="#3b82f6" opacity="0.8"/>
        <rect x="12" y="10" width="13" height="1.5" rx="1" fill="#93c5fd" opacity="0.6"/>
        <rect x="12" y="14" width="9"  height="1.5" rx="1" fill="#93c5fd" opacity="0.4"/>
        <rect x="12" y="18" width="11" height="1.5" rx="1" fill="#93c5fd" opacity="0.4"/>
        <rect x="12" y="22" width="7"  height="1.5" rx="1" fill="#93c5fd" opacity="0.3"/>
        <rect x="12" y="26" width="10" height="1.5" rx="1" fill="#93c5fd" opacity="0.3"/>
        <rect x="5" y="2" width="24" height="40" rx="3" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.4"/>
      </svg>,
    },
    {
      name:'英語リーディング', price:'¥500', sub:'文学部 1年',
      bg:'linear-gradient(160deg,#1e1000,#150c00)',
      svg: <svg width="38" height="44" viewBox="0 0 38 44" fill="none">
        <rect x="7" y="3" width="24" height="38" rx="2" fill="#292000"/>
        <rect x="7" y="3" width="24" height="38" rx="2" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.5"/>
        <circle cx="7" cy="9"  r="2" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="7" cy="16" r="2" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="7" cy="23" r="2" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="7" cy="30" r="2" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="7" cy="37" r="2" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.7"/>
        <rect x="12" y="12" width="14" height="1" rx="0.5" fill="#f97316" opacity="0.3"/>
        <rect x="12" y="17" width="16" height="1" rx="0.5" fill="#f97316" opacity="0.3"/>
        <rect x="12" y="22" width="12" height="1" rx="0.5" fill="#f97316" opacity="0.3"/>
        <rect x="12" y="27" width="15" height="1" rx="0.5" fill="#f97316" opacity="0.3"/>
        <rect x="12" y="32" width="11" height="1" rx="0.5" fill="#f97316" opacity="0.3"/>
      </svg>,
    },
    {
      name:'製図セット', price:'¥2,000', sub:'工学部 4年',
      bg:'linear-gradient(160deg,#150d2e,#0d0820)',
      svg: <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <rect x="5" y="2" width="24" height="40" rx="4" fill="#1e1040"/>
        <rect x="5" y="2" width="24" height="40" rx="4" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.5"/>
        <rect x="9" y="6" width="16" height="10" rx="2" fill="#2d1a60"/>
        <rect x="11" y="9" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.8"/>
        <rect x="15" y="12" width="6" height="1.5" rx="0.75" fill="#a78bfa" opacity="0.5"/>
        <rect x="9"  y="20" width="4" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
        <rect x="15" y="20" width="4" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
        <rect x="21" y="20" width="4" height="4" rx="1" fill="#7c3aed" opacity="0.6"/>
        <rect x="9"  y="26" width="4" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
        <rect x="15" y="26" width="4" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
        <rect x="21" y="26" width="4" height="4" rx="1" fill="#7c3aed" opacity="0.6"/>
        <rect x="9"  y="32" width="10" height="4" rx="1" fill="#312060" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4"/>
        <rect x="21" y="32" width="4" height="4" rx="1" fill="#7c3aed" opacity="0.6"/>
      </svg>,
    },
  ]
  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d14]">
      <div className="px-3 py-2 border-b border-white/5 text-[11px] font-bold text-white">フリマ</div>
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {items.map((item) => (
          <div key={item.name} className="rounded-xl overflow-hidden border border-white/6 bg-white/[0.02]">
            <div className="h-12 flex items-center justify-center" style={{background: item.bg}}>
              {item.svg}
            </div>
            <div className="px-2 py-1.5">
              <div className="text-[8.5px] font-semibold text-white/75 mb-0.5">{item.name}</div>
              <div className="text-[9.5px] font-bold text-[#f6ad55]">{item.price}</div>
              <div className="text-[7px] text-white/25">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimetableMockup() {
  const days = ['月','火','水','木','金']
  const grid: (string | null)[][] = [
    ['英語基礎', null,     '線形代数', null,      null    ],
    [null,       '経営学', null,       null,       '社会学'],
    ['情報処理', null,     null,       '心理学',   null   ],
    [null,       '統計学', null,       null,       '哲学'  ],
  ]
  const colors: Record<string, string> = {
    '英語基礎': 'bg-blue-500/20 text-blue-300',
    '線形代数': 'bg-green-600/20 text-green-300',
    '社会学':   'bg-pink-500/20 text-pink-300',
    '経営学':   'bg-orange-500/20 text-orange-300',
    '情報処理': 'bg-purple-500/20 text-purple-300',
    '統計学':   'bg-teal-500/20 text-teal-300',
    '心理学':   'bg-amber-500/20 text-amber-300',
    '哲学':     'bg-rose-500/20 text-rose-300',
  }
  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d14]">
      <div className="flex items-center px-3 py-2 border-b border-white/5">
        <span className="text-[11px] font-bold text-white flex-1">時間割</span>
        <span className="text-[8px] text-white/25">前期 2026</span>
      </div>
      <div className="flex-1 grid p-2" style={{gridTemplateColumns:'20px repeat(5,1fr)', gap:'2px'}}>
        {/* header */}
        <div />
        {days.map(d => (
          <div key={d} className="text-[8px] text-white/30 text-center py-0.5">{d}</div>
        ))}
        {/* rows */}
        {grid.map((row, ri) => (
          <>
            <div key={`p${ri}`} className="text-[7px] text-white/20 text-right pr-1 pt-1">{ri+1}</div>
            {row.map((cell, ci) => (
              <div key={ci} className={`rounded-md flex items-center justify-center text-[7px] font-semibold min-h-[24px] leading-tight text-center
                ${cell ? colors[cell] : 'bg-white/[0.02]'}`}>
                {cell ?? ''}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  )
}

/* ── スライド定義 ── */

const SLIDES = [
  {
    title: 'unicanへようこそ',
    description: '大学メール（.ac.jp）で登録した学生だけが使えるクローズドコミュニティです。',
    glow: 'from-blue-500/25 to-purple-500/25',
    accent: '#63b3ed',
    Mockup: WelcomeMockup,
  },
  {
    title: '掲示板で情報交換',
    description: '楽単・テスト情報・サークルなど、同じ大学の学生と気軽に情報交換できます。',
    glow: 'from-emerald-500/25 to-teal-500/25',
    accent: '#34d399',
    Mockup: BoardMockup,
  },
  {
    title: 'フリマで教科書を売買',
    description: '同じ大学の学生同士で教科書・参考書・不用品を売買できます。',
    glow: 'from-orange-500/25 to-amber-500/25',
    accent: '#fb923c',
    Mockup: FleaMockup,
  },
  {
    title: '時間割をシェア',
    description: '自分の時間割を登録してURLをシェアできます。友達と一緒の授業を探すのに便利です。',
    glow: 'from-pink-500/25 to-rose-500/25',
    accent: '#f472b6',
    Mockup: TimetableMockup,
  },
] as const

export function OnboardingModal() {
  const [show, setShow] = useState(false)
  const [slide, setSlide] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
  }, [])

  function close() {
    setClosing(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1')
      setShow(false)
      setClosing(false)
    }, 300)
  }

  function next() {
    if (slide < SLIDES.length - 1) setSlide(slide + 1)
    else close()
  }

  if (!show) return null

  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1
  const { Mockup } = current

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4
      transition-all duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}>
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* modal */}
      <div className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl
        bg-[#0d0d14] border border-white/10
        transition-all duration-300
        ${closing ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>

        {/* close */}
        <button onClick={close}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full
            text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* glow bg */}
        <div className={`absolute inset-0 bg-gradient-to-br ${current.glow} opacity-25 transition-all duration-500`} />

        {/* mockup window */}
        <div className="relative mx-5 mt-6 h-48 rounded-2xl overflow-hidden border border-white/8 bg-[#111118]">
          <Mockup />
        </div>

        {/* text content */}
        <div className="relative px-6 pt-4 pb-6 text-center">
          <h2 className="text-lg font-bold text-white mb-1.5">{current.title}</h2>
          <p className="text-xs text-white/50 leading-relaxed mb-5">{current.description}</p>

          {/* dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  height: '5px',
                  width: i === slide ? '18px' : '5px',
                  background: i === slide ? current.accent : 'rgba(255,255,255,0.15)',
                }} />
            ))}
          </div>

          {/* buttons */}
          <div className="flex gap-3">
            {!isLast && (
              <button onClick={close}
                className="flex-1 py-3 text-sm text-white/35 hover:text-white/60 transition-colors">
                スキップ
              </button>
            )}
            <Button onClick={next}
              className={`${isLast ? 'w-full' : 'flex-1'} rounded-xl h-11 font-bold text-white border-0 gap-1`}
              style={{ background: current.accent }}>
              {isLast ? 'はじめる' : <>次へ <ChevronRight className="w-4 h-4" /></>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
