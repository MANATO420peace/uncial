'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
}

export function ImageCarousel({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
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
            className="shrink-0 w-full aspect-square object-cover snap-center"
          />
        ))}
      </div>

      {/* 枚数バッジ（右上） */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      )}

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
  )
}
