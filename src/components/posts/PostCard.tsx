'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageSquare, MapPin, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { ReportButton } from './ReportButton'
import { BookmarkButton } from './BookmarkButton'
import { ShareButton } from './ShareButton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn, timeAgo, truncate } from '@/lib/utils'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from '@/types'
import { toggleLike, deletePost } from '@/lib/actions/posts'
import { getLikeState, setLikeState } from '@/lib/client/likeStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post } from '@/types'

interface Props {
  post: Post
  isOwner?: boolean
  currentUserId?: string
}

export function PostCard({ post, isOwner = false, currentUserId }: Props) {
  const router = useRouter()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const isAnon = post.anonymous
  const authorName = isAnon ? '匿名の学生' : (post.users?.nickname ?? '不明')
  const initial = isAnon ? '匿' : (post.users?.nickname?.[0]?.toUpperCase() ?? '?')
  const universityName = (post.users as never as { universities?: { name: string } | null })?.universities?.name

  // セッション内ストアから初期値を取得（ページ遷移後も状態を保持）
  const initialState = getLikeState(post.id, post.liked ?? false, post.likes_count ?? 0)
  const [liked, setLiked] = useState(initialState.liked)
  const [likesCount, setLikesCount] = useState(initialState.count)
  const [isLiking, setIsLiking] = useState(false)

  // 他端末・他ユーザーのいいねをリアルタイムで受信
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`post-likes:${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` },
        (payload) => {
          // 自分の操作は楽観的更新済みなのでスキップ
          const changedUserId =
            payload.eventType === 'INSERT'
              ? (payload.new as { user_id: string }).user_id
              : (payload.old as { user_id: string }).user_id
          if (currentUserId && changedUserId === currentUserId) return

          if (payload.eventType === 'INSERT') {
            setLikesCount(c => c + 1)
          } else if (payload.eventType === 'DELETE') {
            setLikesCount(c => Math.max(0, c - 1))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [post.id, currentUserId])

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
      const finalLiked = (result && 'liked' in result && result.liked !== undefined) ? result.liked : newLiked
      const finalCount = (result && 'likesCount' in result && result.likesCount != null) ? result.likesCount : Math.max(0, prevCount + (newLiked ? 1 : -1))
      // DBの正確な値に同期し、ストアにも保存（ページ遷移後も維持）
      setLiked(finalLiked)
      setLikesCount(finalCount)
      setLikeState(post.id, finalLiked, finalCount)
    } catch {
      // 失敗時は元に戻す
      setLiked(prevLiked)
      setLikesCount(prevCount)
      setLikeState(post.id, prevLiked, prevCount)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <>
    <article
      className="mx-3 my-2.5 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="p-4">

        {/* ── ヘッダー: アバター + 投稿者情報 + カテゴリバッジ ── */}
        <div className="flex items-center gap-2.5 mb-3">
          {!isAnon && post.user_id ? (
            /* 投稿者エリア全体をタップ可能なボタンに */
            <button
              className="flex items-center gap-2.5 min-w-0 flex-1 -mx-1 px-1 py-0.5 rounded-xl hover:bg-primary/8 active:bg-primary/12 transition-colors group"
              onClick={e => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}
            >
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold leading-tight truncate text-primary group-hover:underline underline-offset-2">
                  {authorName}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {universityName ? `${universityName}・` : ''}{timeAgo(post.created_at)}
                </p>
              </div>
            </button>
          ) : (
            /* 匿名の場合はリンクなし */
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                  匿
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-muted-foreground leading-tight">{authorName}</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {universityName ? `${universityName}・` : ''}{timeAgo(post.created_at)}
                </p>
              </div>
            </div>
          )}

          <Badge
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 text-white border-0 rounded-sm shrink-0',
              POST_CATEGORY_COLORS[post.category]
            )}
          >
            {POST_CATEGORY_LABELS[post.category]}
          </Badge>

          {/* オーナーボタン（マイページ等で表示） */}
          {isOwner && (
            <div className="flex items-center gap-0.5 ml-auto shrink-0" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => router.push(`/post/${post.id}/edit`)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="編集する"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="削除する"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── 画像サムネイル（複数対応） ── */}
        {post.images && post.images.length > 0 && (
          <div
            className="mb-3 rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {post.images.length === 1 && (
              <img src={post.images[0]} alt="" className="w-full h-48 object-cover" />
            )}
            {post.images.length === 2 && (
              <div className="grid grid-cols-2 gap-0.5">
                {post.images.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-40 object-cover" />
                ))}
              </div>
            )}
            {post.images.length >= 3 && (
              <div className="flex gap-0.5 h-48">
                <img
                  src={post.images[0]}
                  alt=""
                  className="w-2/3 h-full object-cover"
                />
                <div className="flex flex-col gap-0.5 w-1/3">
                  <img src={post.images[1]} alt="" className="flex-1 w-full object-cover" />
                  <div className="relative flex-1">
                    <img src={post.images[2]} alt="" className="w-full h-full object-cover" />
                    {post.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{post.images.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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

    {/* 削除確認（isOwner の場合のみ） */}
    {isOwner && (
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                startDeleteTransition(async () => {
                  const result = await deletePost(post.id)
                  if (result?.error) {
                    toast.error(result.error)
                    setDeleteDialogOpen(false)
                    return
                  }
                  toast.success('投稿を削除しました')
                  setDeleteDialogOpen(false)
                  router.refresh()
                })
              }}
            >
              {isDeleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
    </>
  )
}
