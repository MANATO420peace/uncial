'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tag, Plus } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NewPostDialog } from '@/components/posts/NewPostDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/types'

interface Props {
  user: (User & { universities?: { id: string; name: string }; avatar_url?: string | null }) | null
}

function LotusLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="hl-outer" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#c8daf8" />
          <stop offset="100%" stopColor="#5d8fd8" />
        </radialGradient>
        <radialGradient id="hl-mid" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#ddeeff" />
          <stop offset="100%" stopColor="#7ba7e8" />
        </radialGradient>
        <radialGradient id="hl-inner" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#93b8f0" />
        </radialGradient>
        <filter id="hl-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="88" rx="28" ry="5" fill="rgba(100,160,255,0.2)" />
      {/* Outer petals (8) */}
      <g filter="url(#hl-glow)" opacity="0.9">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <ellipse key={angle} cx="50" cy="30" rx="7" ry="20" fill="url(#hl-outer)" transform={`rotate(${angle} 50 65)`} />
        ))}
      </g>
      {/* Mid petals (6) */}
      <g>
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <ellipse key={angle} cx="50" cy="36" rx="5.5" ry="15" fill="url(#hl-mid)" transform={`rotate(${angle} 50 65)`} />
        ))}
      </g>
      {/* Inner petals (5) */}
      <g>
        {[0, 72, 144, 216, 288].map(angle => (
          <ellipse key={angle} cx="50" cy="42" rx="4" ry="10" fill="url(#hl-inner)" transform={`rotate(${angle} 50 65)`} />
        ))}
      </g>
      {/* Stamen */}
      <circle cx="50" cy="63" r="3.5" fill="#fff" />
      <circle cx="46" cy="61" r="1.8" fill="rgba(255,255,255,0.8)" />
      <circle cx="54" cy="61" r="1.8" fill="rgba(255,255,255,0.8)" />
      <circle cx="50" cy="59" r="1.5" fill="#fff" />
    </svg>
  )
}

export function Header({ user }: Props) {
  const pathname = usePathname()
  const isHome = pathname === '/home'
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <header className="header-gradient sticky top-0 z-50 border-b border-black/8 dark:border-white/8">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo + App name */}
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <LotusLogo size={32} />
            <div className="flex flex-col leading-none">
              <span className="font-black text-[19px] tracking-tight leading-none">
                <span className="text-gray-900 dark:text-white">uni</span><span className="text-[#3b82f6] dark:text-[#63b3ed]">can</span>
              </span>
              {isHome && user?.universities?.name && (
                <span className="text-black/40 dark:text-white/55 text-[10px] tracking-wide mt-0.5">{user.universities.name}</span>
              )}
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            <Link
              href="/buy-sell"
              className="h-9 w-9 flex items-center justify-center rounded-full text-black/50 hover:text-black hover:bg-black/5 dark:text-white/75 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              aria-label="販売・購入"
            >
              <Tag className="h-4 w-4" />
            </Link>

            <NotificationBell className="text-black/50 hover:text-black hover:bg-black/5 dark:text-white/75 dark:hover:text-white dark:hover:bg-white/10" />

            <button
              onClick={() => setDialogOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-black/8 text-black hover:bg-black/15 dark:bg-white/20 dark:text-white dark:hover:bg-white/30 transition-colors ml-1"
              aria-label="投稿する"
            >
              <Plus className="h-4 w-4" />
            </button>

            <Link
              href="/profile"
              className="ml-1 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="プロフィール"
            >
              <Avatar className="h-7 w-7 ring-2 ring-black/15 dark:ring-white/30">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="text-xs bg-black/8 text-black dark:bg-white/20 dark:text-white font-semibold">
                  {user?.nickname?.[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <NewPostDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
