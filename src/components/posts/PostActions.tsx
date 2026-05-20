'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { deletePost } from '@/lib/actions/posts'

interface Props {
  postId: string
}

export function PostActions({ postId }: Props) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(postId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('投稿を削除しました')
      router.replace('/home')
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1">
      {/* 編集ボタン */}
      <button
        type="button"
        onClick={() => router.push(`/post/${postId}/edit`)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
        編集
      </button>

      {/* 削除ボタン */}
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        削除
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
