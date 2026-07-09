'use client'

import { useState, useEffect } from 'react'
import { X, Share } from 'lucide-react'

const STORAGE_KEY = 'unican_install_banner_dismissed'

export function InstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // iOS Safari かつ PWA未インストールの場合のみ表示
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
    const dismissed = localStorage.getItem(STORAGE_KEY)

    if (isIOS && !isStandalone && !dismissed) {
      // 少し遅らせて表示（画面遷移後に出す）
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-background border rounded-2xl shadow-xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-sm">📱 ホーム画面に追加しよう</p>
            <p className="text-xs text-muted-foreground mt-0.5">アプリみたいにサクサク使えます</p>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Safariの</span>
          <div className="flex items-center gap-1 bg-background rounded-lg px-2 py-1 border">
            <Share className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-500">共有</span>
          </div>
          <span className="text-xs text-muted-foreground">→「ホーム画面に追加」</span>
        </div>
        <button
          onClick={dismiss}
          className="text-xs text-muted-foreground text-center hover:underline"
        >
          今はしない（次回以降表示しない）
        </button>
      </div>
    </div>
  )
}
