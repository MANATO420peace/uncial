'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
}

function ImageLightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  // タッチ状態
  const touchStartX = useRef<number | null>(null)
  const lastTouches = useRef<React.Touch[]>([])
  const lastScale = useRef(1)
  const lastOffset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  // 画像切り替え時にズームリセット
  useEffect(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
    lastScale.current = 1
    lastOffset.current = { x: 0, y: 0 }
  }, [index])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex(i => Math.min(images.length - 1, i + 1))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [images.length, onClose])

  function getTouchDist(touches: React.TouchList | Touch[]) {
    const [a, b] = Array.from(touches)
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  function handleTouchStart(e: React.TouchEvent) {
    lastTouches.current = Array.from(e.touches) as unknown as React.Touch[]
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      isDragging.current = false
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      // ピンチズーム
      e.preventDefault()
      const newDist = getTouchDist(e.touches)
      const oldDist = getTouchDist(lastTouches.current as unknown as Touch[])
      if (oldDist === 0) return
      const ratio = newDist / oldDist
      const newScale = Math.min(5, Math.max(1, lastScale.current * ratio))

      // ピンチ中心のオフセット計算
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - window.innerWidth / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - window.innerHeight / 2
      const dx = cx - (cx / lastScale.current) * newScale
      const dy = cy - (cy / lastScale.current) * newScale

      setScale(newScale)
      setOffset(o => ({ x: o.x - dx / newScale, y: o.y - dy / newScale }))
      lastScale.current = newScale
    } else if (e.touches.length === 1 && scale > 1) {
      // ズーム中はパン
      isDragging.current = true
      const dx = e.touches[0].clientX - (lastTouches.current[0] as unknown as Touch).clientX
      const dy = e.touches[0].clientY - (lastTouches.current[0] as unknown as Touch).clientY
      setOffset(o => ({ x: o.x + dx / scale, y: o.y + dy / scale }))
    }
    lastTouches.current = Array.from(e.touches) as unknown as React.Touch[]
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (scale <= 1 && !isDragging.current && touchStartX.current !== null && e.touches.length === 0) {
      const diff = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        if (diff > 0) setIndex(i => Math.min(images.length - 1, i + 1))
        else setIndex(i => Math.max(0, i - 1))
      }
    }
    touchStartX.current = null
    isDragging.current = false
    lastOffset.current = offset
  }

  const isZoomed = scale > 1

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden"
      onClick={isZoomed ? undefined : onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 閉じるボタン */}
      <button
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>

      {/* 枚数 */}
      {images.length > 1 && !isZoomed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {index + 1} / {images.length}
        </div>
      )}

      {/* 画像 */}
      <img
        src={images[index]}
        alt={`画像 ${index + 1}`}
        className="max-w-full max-h-full object-contain select-none"
        style={{
          transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          transition: scale === 1 ? 'transform 0.2s ease' : 'none',
          cursor: isZoomed ? 'grab' : 'default',
          touchAction: 'none',
        }}
        onClick={e => e.stopPropagation()}
        draggable={false}
      />

      {/* 前へ（ズーム中は非表示） */}
      {index > 0 && !isZoomed && (
        <button
          className="absolute left-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          onClick={e => { e.stopPropagation(); setIndex(i => i - 1) }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* 次へ（ズーム中は非表示） */}
      {index < images.length - 1 && !isZoomed && (
        <button
          className="absolute right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          onClick={e => { e.stopPropagation(); setIndex(i => i + 1) }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

export function ImageCarousel({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (images.length === 0) return null

  function handleScroll() {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const index = Math.round(scrollLeft / clientWidth)
    setActiveIndex(index)
  }

  function scrollTo(index: number) {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: index * scrollRef.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <>
      <div className="relative mt-4 -mx-4">
        {/* スクロールコンテナ */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleScroll}
        >
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`画像 ${i + 1}`}
              className="shrink-0 w-full aspect-square object-cover snap-center cursor-zoom-in"
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>

        {/* 枚数バッジ（右上） */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* タップで拡大ヒント */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none opacity-60">
          タップで拡大
        </div>

        {/* ドットインジケーター */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === activeIndex
                    ? 'w-4 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-muted-foreground/30'
                )}
                aria-label={`画像${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ライトボックス */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
