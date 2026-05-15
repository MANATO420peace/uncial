'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/follow'
import { toast } from 'sonner'

interface Props {
  targetUserId: string
  initialFollowing: boolean
}

export function FollowButton({ targetUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId)
      if (result.error) {
        toast.error(result.error)
      } else {
        setFollowing(result.following ?? false)
      }
    })
  }

  return (
    <Button
      size="sm"
      variant={following ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={isPending}
    >
      {following ? 'フォロー中' : 'フォロー'}
    </Button>
  )
}
