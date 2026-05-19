'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageSquare, MapPin } from 'lucide-react'
import { ReportButton } from './ReportButton'
import { BookmarkButton } from './BookmarkButton'
import { ShareButton } from './ShareButton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, timeAgo, truncate } from '@/lib/utils'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from '@/types'
import type { Post } from '@/types'

interface Props {
  post: Post
}

export function PostCard({ post }: Props) {
  const router = useRouter()
  const isAnon = post.anonymous
  const authorName = isAnon ? '匿名の学生' : (post.users?.nickname ?? '不明')
  const initial = isAnon ? '匿' : (post.users?.nickname?.[0]?.toUpperCase() ?? '?')
  const universityName = (post.users as never as { universities?: { name: string } | null })?.universities?.name

  return (
    <article
      className="mx-3 my-2.5 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="p-4">

        {/* ── ヘッダー: アバター + 投稿者情報 + カテゴリバッジ ── */}
        <div className="flex items-center gap-2.5 mb-3">
          {!isAnon && post.user_id ? (
            <button
              className="shrink-0"
              onClick={e => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                匿
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 min-w-0">
            {!isAnon && post.user_id ? (
              <button
                className="text-sm font-semibold leading-tight hover:text-primary transition-colors text-left w-full truncate"
                onClick={e => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}
              >
                {authorName}
              </button>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground leading-tight">{authorName}</p>
            )}
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              {universityName ? `${universityName}・` : ''}{timeAgo(post.created_at)}
            </p>
          </div>

          <Badge
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 text-white border-0 rounded-sm shrink-0',
              POST_CATEGORY_COLORS[post.category]
            )}
          >
            {POST_CATEGORY_LABELS[post.category]}
          </Badge>
        </div>

        {/* ── 画像サムネイル ── */}
        {post.images && post.images.length > 0 && (
          <img
            src={post.images[0]}
            alt=""
            className="w-full h-44 rounded-xl object-cover mb-3"
          />
        )}

        {/* ── タイトル ── */}
        <h2 className="font-bold text-sm leading-snug line-clamp-2 mb-1.5">
          {post.title}
        </h2>

        {/* ── 本文プレビュー ── */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {truncate(post.content, 100)}
        </p>

        {/* ── 場所 ── */}
        {(post as never as { location?: string | null }).location && (
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground mt-2">
            <MapPin className="h-2.5 w-2.5" />
            {(post as never as { location?: string }).location}
          </span>
        )}

        {/* ── タグ ── */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.tags.slice(0, 3).map(tag => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent('#' + tag)}`}
                className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors font-medium"
                onClick={e => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── フッター: いいね / コメント / アクション ── */}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/50">
          {/* いいね */}
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                post.liked ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
              )}
            />
            <span className={cn('text-xs font-semibold', post.liked ? 'text-rose-500' : '')}>
              {post.likes_count}
            </span>
          </span>

          {/* コメント */}
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-semibold">{post.comments_count}</span>
          </span>

          {/* 右側アクション */}
          <div className="flex items-center gap-1 ml-auto">
            <span onClick={e => e.stopPropagation()}>
              <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked ?? false} />
            </span>
            <ShareButton postId={post.id} title={post.title} />
            <span onClick={e => e.stopPropagation()}>
              <ReportButton postId={post.id} />
            </span>
          </div>
        </div>

      </div>
    </article>
  )
}
