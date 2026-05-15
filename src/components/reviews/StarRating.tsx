'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={readonly ? 'button' : 'button'}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={cn('transition-colors', !readonly && 'hover:scale-110')}
        >
          <Star
            className={cn(
              iconSize,
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  )
}
