'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, CalendarDays, BookOpen, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function BottomNav({ unreadDmCount = 0 }: Props) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-1 h-16 flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
          const isDM = href === '/messages'
          const showBadge = isDM && unreadDmCount > 0
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
                    {unreadDmCount > 99 ? '99+' : unreadDmCount}
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
