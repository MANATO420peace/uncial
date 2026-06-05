import { Metadata } from 'next'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTopUsers } from '@/lib/actions/points'
import { getBadgeForPoints } from '@/lib/badges'
import { PostCard } from '@/components/posts/PostCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const metadata: Metadata = { title: 'ランキング' }

interface Props {
  searchParams: Promise<{ tab?: string }>
}

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default async function RankingPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const showUsers = tab === 'users'

  const supabase = await createClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: posts }, topUsers] = await Promise.all([
    showUsers ? { data: null } : supabase
      .from('posts')
      .select('*, users(id, nickname), universities(id, name)')
      .gte('created_at', oneWeekAgo)
      .order('likes_count', { ascending: false })
      .limit(20),
    showUsers ? getTopUsers(20) : Promise.resolve([]),
  ])

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h1 className="font-bold text-lg">ランキング</h1>
      </div>

      {/* タブ */}
      <div className="flex border-b">
        <Link
          href="/ranking"
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            !showUsers
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🔥 人気投稿
        </Link>
        <Link
          href="/ranking?tab=users"
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            showUsers
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          👑 ユーザー
        </Link>
      </div>

      {/* 人気投稿ランキング */}
      {!showUsers && (
        <>
          {!posts || posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Trophy className="h-12 w-12 opacity-30" />
              <p className="text-sm">今週の投稿がまだありません</p>
            </div>
          ) : (
            <div>
              {posts.map((post, i) => (
                <div key={post.id} className="relative">
                  {i < 3 && (
                    <span className="absolute left-4 top-4 z-10 text-lg">
                      {RANK_MEDALS[i]}
                    </span>
                  )}
                  <div className={i < 3 ? 'pl-8' : ''}>
                    <PostCard post={{ ...post, images: post.images ?? [] } as never} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ユーザーランキング */}
      {showUsers && (
        <div className="divide-y">
          {topUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Trophy className="h-12 w-12 opacity-30" />
              <p className="text-sm">データがありません</p>
            </div>
          ) : (
            topUsers.map((u, i) => {
              const pts = u.points ?? 0
              const badge = getBadgeForPoints(pts)
              return (
                <Link
                  key={u.id}
                  href={`/user/${u.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  {/* 順位 */}
                  <div className="w-8 text-center shrink-0">
                    {i < 3 ? (
                      <span className="text-xl">{RANK_MEDALS[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  {/* アバター */}
                  <Avatar className="h-10 w-10 shrink-0">
                    {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {u.nickname[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* 名前・大学・バッジ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">{u.nickname}</span>
                      <span className="text-base" title={badge.label}>{badge.emoji}</span>
                    </div>
                    {u.universities?.name && (
                      <p className="text-xs text-muted-foreground truncate">{u.universities.name}</p>
                    )}
                  </div>

                  {/* ポイント */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-primary">{pts.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">pt</p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
