'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Plus, Settings, User, LogOut } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NewPostDialog } from '@/components/posts/NewPostDialog'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/actions/auth'
import type { User } from '@/types'

interface Props {
  user: (User & { universities?: { id: string; name: string }; avatar_url?: string | null }) | null
}

export function Header({ user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/home'
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/home" className="font-bold text-lg tracking-tight">
            {isHome && user?.universities?.name
              ? <span className="text-sm font-semibold">{user.universities.name}</span>
              : 'ユニキャン'}
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
            >
              <Search className="h-4 w-4" />
            </Link>

            <NotificationBell />

            <button
              onClick={() => setDialogOpen(true)}
              className={cn(buttonVariants({ size: 'icon' }), 'h-8 w-8 rounded-full')}
            >
              <Plus className="h-4 w-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Avatar className="h-7 w-7">
                    {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {user?.nickname?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 z-[60]">
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <NewPostDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
