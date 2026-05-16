'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { subscribeToPush, unsubscribeFromPush } from '@/lib/actions/push'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [iosVersion, setIosVersion] = useState(0)

  useEffect(() => {
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as never as { MSStream: unknown }).MSStream
    const standalone = window.navigator.standalone === true
    const match = ua.match(/OS (\d+)_/)
    const version = match ? parseInt(match[1]) : 0
    setIsIOS(ios)
    setIsStandalone(standalone)
    setIosVersion(version)
  }, [])

  return { isIOS, isStandalone, iosVersion }
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isIOS, isStandalone } = useIsIOS()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then(reg => {
      if ('pushManager' in reg) {
        setSupported(true)
        reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
      }
    }).catch(() => {})
  }, [])

  async function subscribe() {
    if (!supported) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('通知の許可が必要です')
        setLoading(false)
        return
      }
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { toast.error('設定エラー'); setLoading(false); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const result = await subscribeToPush(sub.toJSON())
      if (result?.error) toast.error(result.error)
      else { setSubscribed(true); toast.success('プッシュ通知を有効にしました') }
    } catch (err) {
      toast.error('通知の設定に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await unsubscribeFromPush(sub.endpoint)
        await sub.unsubscribe()
        setSubscribed(false)
        toast.success('プッシュ通知をオフにしました')
      }
    } catch { toast.error('設定の変更に失敗しました') }
    setLoading(false)
  }

  return { supported, subscribed, loading, subscribe, unsubscribe, isIOS, isStandalone, iosVersion }
}
