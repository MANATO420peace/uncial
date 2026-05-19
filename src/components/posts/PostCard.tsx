'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageSquare, MapPin, MoreVertical, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { ReportButton } from './ReportButton'
import { BookmarkButton } from './BookmarkButton'
import { ShareButton } from './ShareButton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, timeAgo, truncate } from '@/lib/utils'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from '@/types'
import { toggleLike, deletePost } from '@/lib/actions/posts'
import { toast } from 'sonner'
import type { Post } from '@/types'

interface Props {
  post: Post
  isOwner?: boolean
}

export function PostCard({ post, isOwner = false }: Props) {
  const router = useRouter()
  const isAnon = post.anonymous
  const authorName = isAnon ? '匿名の学生' : (post.users?.nickname ?? '不明')
  const initial = isAnon ? '匿' : (post.users?.nickname?.[0]?.toUpperCase() ?? '?')
  const universityName = (post.users as never as { universities?: { name: string } | null })?.universities?.name

  // 楽観的いいね状態（即時UI反映）
  const [liked, setLiked] = useState(post.liked ?? false)
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0)
  const [isLiking, setIsLiking] = useState(false)

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    if (isLiking) return
    setIsLiking(true)
    // 楽観的更新：即座に反映
    const prevLiked = liked
    const prevCount = likesCount
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(c => Math.max(0, c + (newLiked ? 1 : -1)))
    try {
      const result = await toggleLike(post.id)
      if (result && 'likesCount' in result && result.likesCount != null) {
        // DBの正確なカウントに同期
        setLikesCount(result.likesCount)
      }
      if (result && 'liked' in result && result.liked !== undefined) {
        setLiked(result.liked)
      }
    } catch {
      // 失敗時は元に戻す
      setLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setIsLiking(false)
    }
  }

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

          {/* オーナーメニュー（マイページ等で表示） */}
          {isOwner && (
            <span onClick={e => e.stopPropagation()} className="ml-auto shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded text-muted-foreground hover:text-foreground outline-none">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => router.push(`/post/${post.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    編集する
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={async () => {
                      if (!confirm('この投稿を削除しますか？')) return
                      await deletePost(post.id)
                      toast.success('投稿を削除しました')
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除する
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          )}
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
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <h2 className="font-bold text-sm leading-snug line-clamp-2 flex-1">
            {post.title}
          </h2>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-50" />
        </div>

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
          <button
            className={cn(
              'flex items-center gap-1.5 transition-colors',
              liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'
            )}
            onClick={handleLike}
            disabled={isLiking}
            aria-label="いいね"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-all',
                liked ? 'fill-rose-500 text-rose-500 scale-110' : ''
              )}
            />
            <span className="text-xs font-semibold">{likesCount}</span>
          </button>

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
