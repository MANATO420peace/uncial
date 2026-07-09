'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
}

function ImageLightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

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

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex(i => Math.min(images.length - 1, i + 1))
      else setIndex(i => Math.max(0, i - 1))
    }
    touchStartX.current = null
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
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
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {index + 1} / {images.length}
        </div>
      )}

      {/* 画像 */}
      <img
        src={images[index]}
        alt={`画像 ${index + 1}`}
        className="max-w-full max-h-full object-contain select-none"
        onClick={e => e.stopPropagation()}
      />

      {/* 前へ */}
      {index > 0 && (
        <button
          className="absolute left-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          onClick={e => { e.stopPropagation(); setIndex(i => i - 1) }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* 次へ */}
      {index < images.length - 1 && (
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
