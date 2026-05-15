'use client'

import { useState, useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { handleFollowRequest } from '@/lib/actions/follow'
import { toast } from 'sonner'

interface Request {
  id: string
  created_at: string
  requester: { id: string; nickname: string; avatar_url?: string | null } | null
}

interface Props {
  requests: Request[]
}

export function FollowRequestList({ requests }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const visible = requests.filter(r => !dismissed.has(r.id))

  if (visible.length === 0) return null

  function handle(requestId: string, accept: boolean) {
    startTransition(async () => {
      const result = await handleFollowRequest(requestId, accept)
      if (result.error) {
        toast.error(result.error)
      } else {
        setDismissed(prev => new Set([...prev, requestId]))
        toast.success(accept ? '承認しました' : '拒否しました')
      }
    })
  }

  return (
    <div className="border-b">
      <div className="px-4 py-3 border-b bg-muted/30">
        <p className="text-sm font-semibold">フォローリクエスト ({visible.length})</p>
      </div>
      <ul className="divide-y">
        {visible.map(req => (
          <li key={req.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-10 w-10 shrink-0">
              {req.requester?.avatar_url && <AvatarImage src={req.requester.avatar_url} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {req.requester?.nickname[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="flex-1 text-sm font-medium">{req.requester?.nickname}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handle(req.id, true)} disabled={isPending}>承認</Button>
              <Button size="sm" variant="outline" onClick={() => handle(req.id, false)} disabled={isPending}>拒否</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
