'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, CalendarDays, BookOpen, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUnreadMessageCount } from '@/lib/actions/messages'

const navItems = [
  { href: '/home',        icon: Home,          label: 'ホーム'   },
  { href: '/search',      icon: Search,        label: '検索'     },
  { href: '/messages',    icon: MessageCircle, label: 'DM'       },
  { href: '/timetable',   icon: CalendarDays,  label: '時間割'   },
  { href: '/study-rooms', icon: BookOpen,      label: '対策部屋' },
  { href: '/profile',     icon: User,          label: 'マイページ' },
]

interface Props {
  unreadDmCount?: number
}

const CHAT_DETAIL_RE = /^\/messages\/.+/

export function BottomNav({ unreadDmCount = 0 }: Props) {
  const pathname = usePathname()
  const [dmCount, setDmCount] = useState(unreadDmCount)
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevPathname.current
    prevPathname.current = pathname

    // 初回マウント時はサーバー値をそのまま使う
    if (prev === null) return

    // チャット詳細ページ（/messages/[id]）に「入る」タイミングはスキップ
    // → サーバー側の既読処理がまだ完了していないためレース条件が発生する
    // チャットから「出る」タイミング、またはその他の遷移時に再取得する
    const isEnteringChatDetail = CHAT_DETAIL_RE.test(pathname)
    if (!isEnteringChatDetail) {
      getUnreadMessageCount().then(setDmCount)
    }
  }, [pathname])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-1 h-16 flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
          const isDM = href === '/messages'
          const showBadge = isDM && dmCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', active && 'fill-current')} strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 leading-none">
                    {dmCount > 99 ? '99+' : dmCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
