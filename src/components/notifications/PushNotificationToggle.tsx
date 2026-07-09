'use client'

import { Bell, BellOff, Share } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function PushNotificationToggle() {
  const { supported, subscribed, loading, subscribe, unsubscribe, isIOS, isStandalone, iosVersion } = usePushNotifications()

  // iOSでPWAとしてインストールされていない場合
  if (isIOS && !isStandalone) {
    return (
      <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <Share className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm font-medium">プッシュ通知を有効にするには</p>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1 pl-6 list-decimal">
          <li>Safariの下部の<strong>共有ボタン</strong>をタップ</li>
          <li>「<strong>ホーム画面に追加</strong>」を選択</li>
          <li>ホーム画面のアイコンからアプリを開く</li>
          <li>再度この設定画面で通知をオンにする</li>
        </ol>
      </div>
    )
  }

  // iOSのPWA状態だが16.4未満
  if (isIOS && isStandalone && !supported) {
    return (
      <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <BellOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-medium">プッシュ通知</p>
        </div>
        <p className="text-xs text-muted-foreground">
          iOSのプッシュ通知にはiOS 16.4以上が必要です。
          現在のバージョン: iOS {iosVersion || '不明'}
        </p>
        <p className="text-xs text-muted-foreground">
          設定アプリ → 一般 → ソフトウェアアップデート から更新できます。
        </p>
      </div>
    )
  }

  // その他のブラウザで非対応
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
    <div className="space-y-3">
      {/* トグル */}
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

    </div>
  )
}
