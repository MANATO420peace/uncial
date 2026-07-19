'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { POST_CATEGORY_LABELS, type PostCategory } from '@/types'

// buy_sell は専用ページ（/buy-sell）から利用するためホームフィードには表示しない
const ALL_CATEGORIES: { value: PostCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  ...Object.entries(POST_CATEGORY_LABELS)
    .filter(([value]) => value !== 'buy_sell')
    .map(([value, label]) => ({ value: value as PostCategory, label })),
]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? 'all'

  function handleSelect(category: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/home?${params.toString()}`)
  }

  return (
    <div className="relative border-b">
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2">
        {ALL_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors',
              current === value
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" aria-hidden="true" />
    </div>
  )
}
