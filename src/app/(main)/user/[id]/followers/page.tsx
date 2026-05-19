import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getFollowList } from '@/lib/actions/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft } from 'lucide-react'
import { FollowButton } from '@/components/users/FollowButton'
import { getFollowStats } from '@/lib/actions/follow'

interface Props {
  params: Promise<{ id: string }>
}

type FollowerUser = { id: string; nickname: string; avatar_url?: string | null; universities?: { name: string } | null }

export const metadata: Metadata = { title: 'フォロワー' }

export default async function FollowersPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: profile }, currentUser] = await Promise.all([
    supabase.from('users').select('nickname').eq('id', id).single(),
    getCurrentUser(),
  ])
  if (!profile) notFound()

  const followersRaw = await getFollowList(id, 'followers')
  const followers = followersRaw as unknown as FollowerUser[]

  // 各フォロワーに対して自分がフォローしているかチェック
  const followStatusMap: Record<string, { isFollowing: boolean; hasPendingRequest: boolean }> = {}
  if (currentUser) {
    await Promise.all(
      followers.map(async (u) => {
        if (u.id === currentUser.id) return
        const stats = await getFollowStats(u.id)
        followStatusMap[u.id] = {
          isFollowing: stats.isFollowing,
          hasPendingRequest: stats.hasPendingRequest,
        }
      })
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Link href={`/user/${id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-bold text-sm">{profile.nickname}</h1>
          <p className="text-xs text-muted-foreground">フォロワー</p>
        </div>
      </div>

      {followers.length === 0 ? (
        <p className="text-center py-10 text-sm text-muted-foreground">フォロワーはいません</p>
      ) : (
        <ul className="divide-y">
          {followers.map((u) => {
            const isMe = currentUser?.id === u.id
            const status = followStatusMap[u.id]
            return (
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/user/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10 shrink-0">
                    {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {u.nickname[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.nickname}</p>
                    {u.universities?.name && (
                      <p className="text-xs text-muted-foreground">{u.universities.name}</p>
                    )}
                  </div>
                </Link>
                {currentUser && !isMe && status && (
                  <FollowButton
                    targetUserId={u.id}
                    initialFollowing={status.isFollowing}
                    initialRequestPending={status.hasPendingRequest}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
