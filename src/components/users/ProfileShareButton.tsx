'use client'

import { useState, useEffect, useRef } from 'react'
import { QrCode, X, Download, Share2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'

interface Props {
  userId: string
  nickname: string
}

const SERVICE_URL = 'https://www.uni-can.jp'
const SHARE_TEXT = '大学生のためのコミュニティアプリ「unican」'

function LineIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" fill="currentColor">
      <path d="M24 4C12.95 4 4 11.86 4 21.5c0 5.7 3.13 10.77 8 14.05V42l6.3-3.46A22.6 22.6 0 0 0 24 39c11.05 0 20-7.86 20-17.5S35.05 4 24 4zm-6 22.5l-5-5.5 9.5-10 5.1 5.6L37 11l-9.5 10-5.1-5.6L18 26.5z"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

export function ProfileShareButton({ userId, nickname }: Props) {
  const [showQR, setShowQR] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/user/${userId}`
    : `${SERVICE_URL}/user/${userId}`

  useEffect(() => {
    if (!showQR || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, profileUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [showQR, profileUrl])

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(SERVICE_URL)
      setCopied(true)
      toast.success('URLをコピーしました')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  function openPopup(url: string) {
    const w = 600, h = 500
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    window.open(url, 'share', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`)
  }

  function handleLineShare() {
    const text = `${SHARE_TEXT}\n${SERVICE_URL}`
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = `https://line.me/R/share?text=${encodeURIComponent(text)}`
    } else {
      openPopup(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(SERVICE_URL)}`)
    }
  }

  function handleXShare() {
    openPopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SERVICE_URL)}`)
  }

  function handleDownloadQR() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `unican-${nickname}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowQR(true)}
          className="h-9 w-9 flex items-center justify-center rounded-full border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="QRコードを表示"
        >
          <QrCode className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="h-9 w-9 flex items-center justify-center rounded-full border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="unicanをシェア"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* シェアモーダル */}
      {showShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-background rounded-2xl p-6 flex flex-col gap-4 shadow-2xl w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-base">unicanをシェア</p>
                <p className="text-xs text-muted-foreground">友達に紹介する</p>
              </div>
              <button
                onClick={() => setShowShare(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleLineShare}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#06C755] text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <LineIcon />
                LINEでシェア
              </button>
              <button
                onClick={handleXShare}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black text-white font-medium text-sm hover:opacity-80 transition-opacity"
              >
                <XIcon />
                Xでシェア
              </button>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                URLをコピー
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRモーダル */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-background rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-bold text-base">{nickname}</p>
                <p className="text-xs text-muted-foreground">プロフィールQRコード</p>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl">
              <canvas ref={canvasRef} />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              スキャンしてプロフィールを開く
            </p>

            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Download className="h-4 w-4" />
              QRコードを保存
            </button>
          </div>
        </div>
      )}
    </>
  )
}
