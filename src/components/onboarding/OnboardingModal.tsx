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
    { emoji:'📗', name:'基礎化学 改訂版', price:'¥800', sub:'経済学部 3年', bg:'rgba(249,115,22,0.08)' },
    { emoji:'📘', name:'統計学テキスト', price:'¥1,200', sub:'理工学部 2年', bg:'rgba(245,158,11,0.08)' },
    { emoji:'📙', name:'英語リーディング', price:'¥500', sub:'文学部 1年', bg:'rgba(249,115,22,0.08)' },
    { emoji:'🖊️', name:'製図セット', price:'¥2,000', sub:'工学部 4年', bg:'rgba(245,158,11,0.08)' },
  ]
  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d14]">
      <div className="px-3 py-2 border-b border-white/5 text-[11px] font-bold text-white">フリマ</div>
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {items.map((item) => (
          <div key={item.name} className="rounded-xl overflow-hidden border border-white/6 bg-white/[0.02]">
            <div className="h-12 flex items-center justify-center text-2xl" style={{background: item.bg}}>
              {item.emoji}
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
    ['英語基礎', null,     '線形代数', null,     '社会学'],
    [null,       '経営学', null,       '英語基礎', null   ],
    ['情報処理', null,     '経営学',   null,       '統計学'],
    [null,       '情報処理', null,     '社会学',   null   ],
  ]
  const colors: Record<string, string> = {
    '英語基礎': 'bg-blue-500/20 text-blue-300',
    '線形代数': 'bg-green-600/20 text-green-300',
    '社会学':   'bg-pink-500/20 text-pink-300',
    '経営学':   'bg-orange-500/20 text-orange-300',
    '情報処理': 'bg-purple-500/20 text-purple-300',
    '統計学':   'bg-teal-500/20 text-teal-300',
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
