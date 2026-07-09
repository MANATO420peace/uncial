'use client'

import { useState, useEffect, useRef } from 'react'
import { QrCode, X, Download } from 'lucide-react'
import QRCode from 'qrcode'

interface Props {
  userId: string
  nickname: string
}

export function ProfileShareButton({ userId, nickname }: Props) {
  const [showQR, setShowQR] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/user/${userId}`
    : `https://www.uni-can.jp/user/${userId}`

  useEffect(() => {
    if (!showQR || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, profileUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [showQR, profileUrl])

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
      <button
        onClick={() => setShowQR(true)}
        className="h-9 w-9 flex items-center justify-center rounded-full border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="QRコードを表示"
      >
        <QrCode className="h-4 w-4" />
      </button>

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
