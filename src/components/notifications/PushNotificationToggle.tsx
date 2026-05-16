'use client'

import { Bell, BellOff } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function PushNotificationToggle() {
  const { supported, subscribed, loading, subscribe, unsubscribe } = usePushNotifications()

  if (!supported) {
    return (
      <div className="flex items-center justify-between py-2 border rounded-lg px-3 opacity-50">
        <div className="flex items-center gap-2">
          <BellOff className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">プッシュ通知</p>
            <p className="text-xs text-muted-foreground">このブラウザでは利用できません</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-2 border rounded-lg px-3">
      <div className="flex items-center gap-2">
        {subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium">プッシュ通知</p>
          <p className="text-xs text-muted-foreground">
            {subscribed ? '有効 — いいね・コメント・フォローを通知' : 'オフ — タップして許可する'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${subscribed ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${subscribed ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
