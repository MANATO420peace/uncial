'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, VolumeX, Volume2, ShieldBan, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleBlock, toggleMute } from '@/lib/actions/block'

interface Props {
  targetUserId: string
  initialBlocked: boolean
  initialMuted: boolean
  targetNickname: string
}

export function UserActionMenu({ targetUserId, initialBlocked, initialMuted, targetNickname }: Props) {
  const [isBlocked, setIsBlocked] = useState(initialBlocked)
  const [isMuted, setIsMuted] = useState(initialMuted)
  const [isPending, startTransition] = useTransition()

  function handleBlock() {
    const action = isBlocked ? 'ブロック解除' : 'ブロック'
    if (!isBlocked && !confirm(`${targetNickname}さんをブロックしますか？\nフォロー関係も解除されます。`)) return

    startTransition(async () => {
      const result = await toggleBlock(targetUserId)
      if (result?.error) { toast.error(result.error); return }
      setIsBlocked(result.blocked ?? !isBlocked)
      toast.success(`${targetNickname}さんを${action}しました`)
    })
  }

  function handleMute() {
    const action = isMuted ? 'ミュート解除' : 'ミュート'
    startTransition(async () => {
      const result = await toggleMute(targetUserId)
      if (result?.error) { toast.error(result.error); return }
      setIsMuted(result.muted ?? !isMuted)
      toast.success(`${targetNickname}さんを${action}しました`)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-9 w-9 flex items-center justify-center rounded-full border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
        disabled={isPending}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleMute}>
          {isMuted ? (
            <><Volume2 className="h-4 w-4 mr-2" />ミュート解除</>
          ) : (
            <><VolumeX className="h-4 w-4 mr-2" />ミュートする</>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleBlock}
          className={isBlocked ? '' : 'text-destructive focus:text-destructive'}
        >
          {isBlocked ? (
            <><ShieldCheck className="h-4 w-4 mr-2" />ブロック解除</>
          ) : (
            <><ShieldBan className="h-4 w-4 mr-2" />ブロックする</>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
