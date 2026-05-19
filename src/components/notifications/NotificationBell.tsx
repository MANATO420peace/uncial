'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    getNotifications().then(({ unreadCount }) => setUnreadCount(unreadCount))
  }, [])

  return (
    <Link
      href="/notifications"
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 relative', className)}
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
