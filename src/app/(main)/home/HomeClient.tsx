'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewPostDialog } from '@/components/posts/NewPostDialog'

interface Props {
  openNew: boolean
  children: React.ReactNode
}

export function HomeClient({ openNew, children }: Props) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(openNew)

  function handleOpenChange(open: boolean) {
    setDialogOpen(open)
    if (openNew && !open) {
      router.replace('/home')
    }
  }

  return (
    <>
      {children}
      <NewPostDialog open={dialogOpen} onOpenChange={handleOpenChange} />
    </>
  )
}
