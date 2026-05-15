import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFollowList } from '@/lib/actions/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'フォロワー' }

export default async function FollowersPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('users').select('nickname').eq('id', id).single()
  if (!profile) notFound()

  const followers = await getFollowList(id, 'followers')

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
          {followers.map((user: never) => {
            const u = user as { id: string; nickname: string; avatar_url?: string | null; universities?: { name: string } | null }
            return (
              <li key={u.id}>
                <Link href={`/user/${u.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10 shrink-0">
                    {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {u.nickname[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{u.nickname}</p>
                    {u.universities?.name && (
                      <p className="text-xs text-muted-foreground">{u.universities.name}</p>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
