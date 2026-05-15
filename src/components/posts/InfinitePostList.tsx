'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PostCard } from './PostCard'
import { getPosts } from '@/lib/actions/posts'
import type { Post, PostFilter } from '@/types'

interface Props {
  initialPosts: Post[]
  filter: PostFilter
}

export function InfinitePostList({ initialPosts, filter }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length === 20)
  }, [initialPosts])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const { posts: more } = await getPosts({ ...filter, offset: posts.length })
    setPosts(prev => [...prev, ...(more as Post[])])
    setHasMore(more.length === 20)
    setLoading(false)
  }, [loading, hasMore, posts.length, filter])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <p className="text-sm">投稿がまだありません</p>
        <p className="text-xs">最初の投稿をしてみましょう</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
        {loading ? '読み込み中...' : !hasMore ? 'これ以上の投稿はありません' : ''}
      </div>
    </div>
  )
}
