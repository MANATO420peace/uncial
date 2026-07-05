'use client'

import { useState } from 'react'
import { Bell, BellOff, Share, FlaskConical, CheckCircle2, XCircle } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { runNotificationDiagnostics } from '@/lib/actions/debug'

export function PushNotificationToggle() {
  const { supported, subscribed, loading, subscribe, unsubscribe, isIOS, isStandalone, iosVersion } = usePushNotifications()
  const [diagResult, setDiagResult] = useState<{ label: string; ok: boolean; detail: string }[] | null>(null)
  const [diagLoading, setDiagLoading] = useState(false)

  async function runDiag() {
    setDiagLoading(true)
    const result = await runNotificationDiagnostics()
    setDiagResult(result.steps ?? [])
    setDiagLoading(false)
  }

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

      {/* 診断ボタン */}
      <button
        type="button"
        onClick={runDiag}
        disabled={diagLoading}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        {diagLoading ? '診断中...' : '通知が届かない場合はここをタップ（テスト送信）'}
      </button>

      {/* 診断結果 */}
      {diagResult && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-semibold">診断結果</p>
          {diagResult.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              {step.ok
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              }
              <div>
                <p className="text-xs font-medium leading-tight">{step.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
