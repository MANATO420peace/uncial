'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Heart, CornerDownRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn, timeAgo } from '@/lib/utils'
import { createComment, deleteComment, toggleCommentLike } from '@/lib/actions/comments'
import type { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  postId: string
  currentUserId?: string
  isReply?: boolean
}

function CommentItem({ comment, postId, currentUserId, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [liked, setLiked] = useState(comment.liked ?? false)
  const [likeCount, setLikeCount] = useState(comment.likes_count)
  const [deleted, setDeleted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const authorName = comment.anonymous ? '匿名の学生' : (comment.users?.nickname ?? '不明')
  const isOwner = !comment.anonymous && currentUserId && currentUserId === comment.user_id

  if (deleted) return null

  function handleLike() {
    startTransition(async () => {
      const result = await toggleCommentLike(comment.id, postId)
      if (result?.error) { toast.error(result.error); return }
      if (result?.liked !== undefined) {
        setLiked(result.liked)
        setLikeCount(c => result.liked ? c + 1 : c - 1)
      }
    })
  }

  function handleDelete() {
    if (!confirm('このコメントを削除しますか？')) return
    startTransition(async () => {
      const result = await deleteComment(comment.id, postId)
      if (result?.error) { toast.error(result.error); return }
      setDeleted(true)
      toast.success('コメントを削除しました')
    })
  }

  return (
    <div className={cn('py-3', isReply && 'pl-8 border-l-2 border-muted ml-4')}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{authorName}</span>
              <span className="text-[11px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5 shrink-0"
                aria-label="コメントを削除"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={cn(
                'flex items-center gap-1 text-[11px] transition-colors',
                liked ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Heart className={cn('h-3 w-3', liked && 'fill-rose-500')} />
              {likeCount}
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(v => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <CornerDownRight className="h-3 w-3" />
                返信
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-2 pl-0">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            compact
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-0 divide-y">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  compact?: boolean
}

function CommentForm({ postId, parentId, onSuccess, compact }: FormProps) {
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      const formData = new FormData()
      formData.set('post_id', postId)
      formData.set('content', content)
      formData.set('anonymous', String(anonymous))
      if (parentId) formData.set('parent_id', parentId)
      const result = await createComment(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setContent('')
        onSuccess?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={parentId ? '返信を入力...' : 'コメントを入力...'}
        rows={compact ? 2 : 3}
        maxLength={500}
        className="resize-none text-sm"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
            className="h-3.5 w-3.5 rounded"
          />
          <span className="text-xs text-muted-foreground">匿名</span>
        </label>
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? '送信中...' : '送信'}
        </Button>
      </div>
    </form>
  )
}

interface Props {
  comments: Comment[]
  postId: string
  currentUserId?: string
}

export function CommentSection({ comments, postId, currentUserId }: Props) {
  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">コメントを追加</h3>
        <div className="mt-3">
          <CommentForm postId={postId} />
        </div>
      </div>

      <div className="divide-y">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            まだコメントがありません
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="px-4">
              <CommentItem
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
