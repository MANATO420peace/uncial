import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ChevronLeft, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from '@/components/posts/LikeButton'
import { PostActions } from '@/components/posts/PostActions'
import { SoldButton } from '@/components/posts/SoldButton'
import { ImageCarousel } from '@/components/posts/ImageCarousel'
import { ViewIncrementer } from '@/components/posts/ViewIncrementer'
import { CommentSection } from '@/components/comments/CommentSection'
import { getPost } from '@/lib/actions/posts'
import { getComments } from '@/lib/actions/comments'
import { createClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS, ITEM_CONDITION_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { Eye } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { post } = await getPost(id)
  return { title: post?.title ?? '投稿' }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ post }, { comments }] = await Promise.all([getPost(id), getComments(id)])

  if (!post) notFound()

  const postCategory = post.category as import('@/types').PostCategory
  const isOwner = user?.id === post.user_id
  const authorName = post.anonymous ? '匿名の学生' : (post.users?.nickname ?? '不明')
  const isBuySell = postCategory === 'buy_sell'

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background border-b px-4 h-10 flex items-center justify-between gap-2">
        <Link href={isBuySell ? '/buy-sell' : '/home'} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Link>
        {isOwner && <PostActions postId={post.id} />}
      </div>

      <article className="px-4 py-5 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 text-white border-0 rounded-sm',
              POST_CATEGORY_COLORS[postCategory]
            )}
          >
            {POST_CATEGORY_LABELS[postCategory]}
          </Badge>
          {post.universities && (
            <span className="text-xs text-muted-foreground">{post.universities.name}</span>
          )}
          {isBuySell && post.sold_at && (
            <span className="text-xs font-bold text-muted-foreground border rounded px-1.5 py-0.5">
              SOLD
            </span>
          )}
        </div>

        <h1 className="text-lg font-bold leading-snug mb-3">{post.title}</h1>

        {/* 販売・購入専用: 価格・状態 */}
        {isBuySell && (
          <div className="mb-4 p-3 rounded-xl bg-muted/50 border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                {post.price != null ? `¥${post.price.toLocaleString()}` : '価格応相談'}
              </span>
              {isOwner && (
                <SoldButton postId={post.id} initialSold={!!post.sold_at} />
              )}
            </div>
            {post.item_condition && (
              <p className="text-xs text-muted-foreground">
                状態：{ITEM_CONDITION_LABELS[post.item_condition] ?? post.item_condition}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
          <span>{authorName}</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>

        <p className="text-sm leading-7 whitespace-pre-wrap text-foreground">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <ImageCarousel images={post.images} />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-5">
          <LikeButton
            postId={post.id}
            initialLiked={post.liked ?? false}
            initialCount={post.likes_count}
          />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            {post.comments_count}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
            <Eye className="h-4 w-4" />
            {((post as never as { views_count?: number }).views_count ?? 0).toLocaleString()}
          </span>
        </div>
      </article>

      <ViewIncrementer postId={post.id} />

      <CommentSection comments={comments ?? []} postId={post.id} currentUserId={user?.id} />
    </div>
  )
}
