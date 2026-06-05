'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PackageCheck, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markAsSold, markAsAvailable } from '@/lib/actions/posts'

interface Props {
  postId: string
  initialSold: boolean
}

export function SoldButton({ postId, initialSold }: Props) {
  const [isSold, setIsSold] = useState(initialSold)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    if (isSold) {
      if (!confirm('販売中に戻しますか？')) return
    } else {
      if (!confirm('この商品を売り切れにしますか？')) return
    }

    startTransition(async () => {
      const result = isSold
        ? await markAsAvailable(postId)
        : await markAsSold(postId)
      if (result?.error) { toast.error(result.error); return }
      setIsSold(v => !v)
      toast.success(isSold ? '販売中に戻しました' : '売り切れにしました')
    })
  }

  return (
    <Button
      variant={isSold ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1.5"
    >
      {isSold ? (
        <><PackageOpen className="h-4 w-4" />販売中に戻す</>
      ) : (
        <><PackageCheck className="h-4 w-4" />売り切れにする</>
      )}
    </Button>
  )
}
