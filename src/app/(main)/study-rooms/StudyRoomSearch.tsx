'use client'

import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useTransition } from 'react'

interface Props {
  defaultValue?: string
}

export function StudyRoomSearch({ defaultValue = '' }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [, startTransition] = useTransition()

  function handleChange(v: string) {
    setValue(v)
    startTransition(() => {
      if (v.trim()) {
        router.push(`/study-rooms?q=${encodeURIComponent(v.trim())}`)
      } else {
        router.push('/study-rooms')
      }
    })
  }

  return (
    <div className="px-4 py-2 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="授業名で検索..."
          className="w-full h-9 pl-9 pr-8 rounded-lg bg-muted text-sm placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring"
        />
        {value && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
