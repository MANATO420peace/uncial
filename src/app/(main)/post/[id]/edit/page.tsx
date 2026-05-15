'use client'

import { useState, useTransition, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getPost, updatePost } from '@/lib/actions/posts'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getPost(id).then(({ post }) => {
      if (!post) { router.replace('/home'); return }
      setTitle(post.title)
      setContent(post.content)
      setTags(post.tags?.join(', ') ?? '')
      setLoaded(true)
    })
  }, [id])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updatePost(id, formData)
      if (result?.error) toast.error(result.error)
    })
  }

  if (!loaded) return <div className="px-4 py-10 text-center text-sm text-muted-foreground">読み込み中...</div>

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background border-b px-4 h-10 flex items-center gap-2">
        <Link href={`/post/${id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold">投稿を編集</h1>

        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">本文</Label>
          <Textarea id="content" name="content" value={content} onChange={e => setContent(e.target.value)} required rows={8} maxLength={2000} className="resize-none" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">タグ（カンマ区切り）</Label>
          <Input id="tags" name="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="例: 数学, 試験対策" />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '保存中...' : '保存する'}
        </Button>
      </form>
    </div>
  )
}
