'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageSquare, MapPin } from 'lucide-react'
import { ReportButton } from './ReportButton'
import { BookmarkButton } from './BookmarkButton'
import { ShareButton } from './ShareButton'
import { Badge } from '@/components/ui/badge'
import { cn, timeAgo, truncate } from '@/lib/utils'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from '@/types'
import type { Post } from '@/types'

interface Props {
  post: Post
}

export function PostCard({ post }: Props) {
  const router = useRouter()
  const authorName = post.anonymous ? '匿名の学生' : (post.users?.nickname ?? '不明')

  return (
    <article
      className="px-4 py-4 border-b hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="flex items-start gap-3">
        {post.images && post.images.length > 0 && (
          <img src={post.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={cn(
                'text-[10px] px-1.5 py-0 h-4 text-white border-0 rounded-sm',
                POST_CATEGORY_COLORS[post.category]
              )}
            >
              {POST_CATEGORY_LABELS[post.category]}
            </Badge>
            {post.tags?.slice(0, 2).map(tag => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-[10px] text-blue-500 hover:underline"
                onClick={e => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>

          <h2 className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {truncate(post.content, 120)}
          </p>

          {(post as never as { location?: string | null }).location && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />
              {(post as never as { location?: string }).location}
            </span>
          )}

          <div className="flex items-center gap-3 pt-0.5">
            {!post.anonymous && post.user_id ? (
              <span
                className="text-[11px] text-blue-500 hover:text-blue-700 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}
              >
                {authorName}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">{authorName}</span>
            )}
            <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</span>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Heart className={cn('h-3 w-3', post.liked && 'fill-rose-500 text-rose-500')} />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {post.comments_count}
              </span>
              <span onClick={(e) => e.stopPropagation()}>
                <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked ?? false} />
              </span>
              <ShareButton postId={post.id} title={post.title} />
              <span onClick={(e) => e.stopPropagation()}>
                <ReportButton postId={post.id} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
