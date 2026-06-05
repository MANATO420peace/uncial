'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from './ImageUpload'
import { createPost } from '@/lib/actions/posts'
import { uploadImages } from '@/lib/uploadImages'
import { POST_CATEGORY_LABELS, type PostCategory } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewPostDialog({ open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<PostCategory>('chat')
  const [anonymous, setAnonymous] = useState(true)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    startTransition(async () => {
      const formData = new FormData(form)
      formData.set('category', category)
      formData.set('anonymous', String(anonymous))
      if (imageFiles.length > 0) {
        const urls = await uploadImages(imageFiles)
        formData.set('images', JSON.stringify(urls))
      }
      const result = await createPost(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-4">
        <DialogHeader>
          <DialogTitle>新規投稿</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>カテゴリ</Label>
            <Select value={category} onValueChange={(v) => { if (v) setCategory(v as PostCategory) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(POST_CATEGORY_LABELS) as [PostCategory, string][])
                  .filter(([value]) => value !== 'buy_sell')
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-title">タイトル</Label>
            <Input id="post-title" name="title" placeholder="タイトルを入力" required maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-content">本文</Label>
            <Textarea id="post-content" name="content" placeholder="内容を入力..." required rows={4} maxLength={2000} />
          </div>

          <div className="space-y-1.5">
            <Label>画像（任意）</Label>
            <ImageUpload files={imageFiles} onChange={setImageFiles} maxImages={4} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-tags">タグ（カンマ区切り）</Label>
            <Input id="post-tags" name="tags" placeholder="テスト,2024,○○教授" />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">匿名で投稿</span>
            </label>
            <Button type="submit" disabled={isPending}>
              {isPending ? '投稿中...' : '投稿する'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
