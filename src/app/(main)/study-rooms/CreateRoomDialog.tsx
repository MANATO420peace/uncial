'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createStudyRoom } from '@/lib/actions/study-rooms'

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createStudyRoom(formData)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          部屋を作る
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>試験対策部屋を作成</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="course_name">授業名 *</Label>
            <Input id="course_name" name="course_name" required placeholder="例：線形代数学" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">説明</Label>
            <Textarea id="description" name="description" placeholder="例：期末試験の過去問・ノートを共有しましょう" rows={3} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '作成中...' : '作成する'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
