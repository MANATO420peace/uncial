'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { handleFollowRequestByActor } from '@/lib/actions/follow'
import { toast } from 'sonner'

interface Props {
  requesterId: string
}

export function FollowRequestActions({ requesterId }: Props) {
  const [done, setDone] = useState<'accepted' | 'rejected' | null>(null)
  const [isPending, startTransition] = useTransition()

  function handle(accept: boolean) {
    startTransition(async () => {
      const result = await handleFollowRequestByActor(requesterId, accept)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setDone(accept ? 'accepted' : 'rejected')
      toast.success(accept ? 'フォローを承認しました' : 'リクエストを拒否しました')
    })
  }

  if (done === 'accepted') return <span className="text-xs text-primary font-medium">承認済み</span>
  if (done === 'rejected') return <span className="text-xs text-muted-foreground">拒否済み</span>

  return (
    <div className="flex gap-2 mt-2" onClick={e => e.preventDefault()}>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs px-3"
        disabled={isPending}
        onClick={() => handle(false)}
      >
        拒否
      </Button>
      <Button
        size="sm"
        className="h-7 text-xs px-3"
        disabled={isPending}
        onClick={() => handle(true)}
      >
        承認
      </Button>
    </div>
  )
}
