'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { getNotifications } from '@/lib/actions/notifications'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps = {}) {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchCount = useCallback(async () => {
    try {
      const { unreadCount } = await getNotifications()
      setUnreadCount(unreadCount)
    } catch {
      // 取得失敗は無視
    }
  }, [])

  useEffect(() => {
    // 初回取得
    fetchCount()
    // 30秒ごとにポーリング
    const interval = setInterval(fetchCount, 30_000)
    // タブがアクティブになったときも取得
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCount()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchCount])

  return (
    <Link
      href="/notifications"
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 relative', className)}
      onClick={() => setUnreadCount(0)}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
