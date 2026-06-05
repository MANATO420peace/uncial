'use client'

import { useEffect } from 'react'
import { incrementPostView } from '@/lib/actions/posts'

export function ViewIncrementer({ postId }: { postId: string }) {
  useEffect(() => {
    incrementPostView(postId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
