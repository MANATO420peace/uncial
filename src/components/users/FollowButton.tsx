'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/follow'
import { toast } from 'sonner'

interface Props {
  targetUserId: string
  initialFollowing: boolean
  initialRequestPending?: boolean
}

export function FollowButton({ targetUserId, initialFollowing, initialRequestPending = false }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [requested, setRequested] = useState(initialRequestPending)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId)
      if (result.error) {
        toast.error(result.error)
      } else {
        setFollowing(result.following ?? false)
        setRequested(result.requested ?? false)
      }
    })
  }

  const label = following ? 'フォロー中' : requested ? 'リクエスト中' : 'フォロー'
  const variant = following || requested ? 'outline' : 'default'

  return (
    <Button size="sm" variant={variant} onClick={handleClick} disabled={isPending}>
      {label}
    </Button>
  )
}
