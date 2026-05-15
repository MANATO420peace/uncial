'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { SortOrder } from '@/types'

const SORTS: { value: SortOrder; label: string }[] = [
  { value: 'new', label: '新着' },
  { value: 'popular', label: '人気' },
  { value: 'comments', label: 'コメント' },
]

export function SortTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get('sort') ?? 'new') as SortOrder

  function handleSelect(sort: SortOrder) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`/home?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 px-4 py-2 border-b text-sm">
      {SORTS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          className={cn(
            'pb-1 font-medium transition-colors border-b-2',
            current === value
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
