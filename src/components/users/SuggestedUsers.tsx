import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
  id: string
  nickname: string
  avatar_url: string | null
  universities: { name: string } | null
}

interface Props {
  users: User[]
}

export function SuggestedUsers({ users }: Props) {
  if (users.length === 0) return null

  return (
    <div className="mx-3 my-2.5 rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-muted-foreground">フォローしてみませんか</p>
      </div>
      <ul className="divide-y divide-border/50">
        {users.map(user => (
          <li key={user.id}>
            <Link
              href={`/user/${user.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
            >
              <Avatar className="h-9 w-9 shrink-0">
                {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {user.nickname[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold truncate block">{user.nickname}</span>
                {user.universities?.name && (
                  <p className="text-xs text-muted-foreground truncate">{user.universities.name}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
