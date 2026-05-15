'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { startConversation } from '@/lib/actions/messages'
import { toast } from 'sonner'

interface Props {
  targetUserId: string
}

export function DMButton({ targetUserId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await startConversation(targetUserId)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      <MessageCircle className="h-4 w-4 mr-1" />
      DM
    </Button>
  )
}
