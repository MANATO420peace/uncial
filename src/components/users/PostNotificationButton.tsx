'use client'

import { useState } from 'react'
import { Bell, BellOff, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { updatePostNotification } from '@/lib/actions/postNotifications'
import type { PostNotificationStatus } from '@/lib/actions/postNotifications'

interface Props {
  targetUserId: string
  initialStatus: PostNotificationStatus
}

export function PostNotificationButton({ targetUserId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const anyOn = status.notify_posts || status.notify_buy_sell

  async function handleToggle(field: 'notify_posts' | 'notify_buy_sell') {
    setLoading(true)
    const newPosts = field === 'notify_posts' ? !status.notify_posts : status.notify_posts
    const newBuySell = field === 'notify_buy_sell' ? !status.notify_buy_sell : status.notify_buy_sell
    const result = await updatePostNotification(targetUserId, newPosts, newBuySell)
    if (result.error) {
      toast.error(result.error)
    } else {
      setStatus({ exists: newPosts || newBuySell, notify_posts: newPosts, notify_buy_sell: newBuySell })
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={anyOn ? 'default' : 'outline'} size="sm" disabled={loading} className="gap-1">
          {anyOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          通知
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted rounded-sm"
          onClick={() => handleToggle('notify_posts')}
        >
          <span>投稿通知</span>
          <span className={`text-xs font-bold ${status.notify_posts ? 'text-primary' : 'text-muted-foreground'}`}>
            {status.notify_posts ? 'ON' : 'OFF'}
          </span>
        </button>
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted rounded-sm"
          onClick={() => handleToggle('notify_buy_sell')}
        >
          <span>出品通知</span>
          <span className={`text-xs font-bold ${status.notify_buy_sell ? 'text-primary' : 'text-muted-foreground'}`}>
            {status.notify_buy_sell ? 'ON' : 'OFF'}
          </span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
