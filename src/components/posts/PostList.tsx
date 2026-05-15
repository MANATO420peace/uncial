import { PostCard } from './PostCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Post } from '@/types'

interface Props {
  posts: Post[]
}

export function PostList({ posts }: Props) {
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
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export function PostListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-4 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12 rounded-sm" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}
