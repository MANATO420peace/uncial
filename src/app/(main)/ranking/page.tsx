import { Metadata } from 'next'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'

export const metadata: Metadata = { title: '人気ランキング' }

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default async function RankingPage() {
  const supabase = await createClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(id, nickname), universities(id, name)')
    .gte('created_at', oneWeekAgo)
    .order('likes_count', { ascending: false })
    .limit(20)

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h1 className="font-bold text-lg">今週の人気投稿</h1>
      </div>

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
    </div>
  )
}
