'use client'

import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { togglePostNotification } from '@/lib/actions/postNotifications'

interface Props {
  targetUserId: string
  initialEnabled: boolean
}

export function PostNotificationButton({ targetUserId, initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await togglePostNotification(targetUserId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setEnabled(result.enabled ?? false)
      toast.success(result.enabled ? '投稿通知をONにしました🔔' : '投稿通知をOFFにしました')
    }
    setLoading(false)
  }

  return (
    <Button
      variant={enabled ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="gap-1.5"
    >
      {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      {enabled ? '通知ON' : '通知OFF'}
    </Button>
  )
}
