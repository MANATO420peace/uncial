import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import { getFollowingPosts } from '@/lib/actions/follow'
import { getCurrentUser, getSuggestedUsers } from '@/lib/actions/user'
import { PostListSkeleton } from '@/components/posts/PostList'
import { InfinitePostList } from '@/components/posts/InfinitePostList'
import { CategoryFilter } from '@/components/posts/CategoryFilter'
import { SortTabs } from '@/components/posts/SortTabs'
import { SuggestedUsers } from '@/components/users/SuggestedUsers'
import { HomeClient } from './HomeClient'
import type { PostCategory, SortOrder } from '@/types'

export const metadata: Metadata = { title: 'ホーム' }

interface Props {
  searchParams: Promise<{ category?: string; sort?: string; new?: string; tab?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const user = await getCurrentUser()
  const tab = params.tab ?? 'all'
  const openNew = params.new === '1'

  const filter = { university_id: user?.university_id ?? undefined, category: params.category as PostCategory | undefined, sort: (params.sort as SortOrder) ?? 'new' }
  const [postsResult, suggestedUsers] = await Promise.all([
    tab === 'following' ? getFollowingPosts() : getPosts(filter),
    getSuggestedUsers(5),
  ])
  const { posts } = postsResult

  return (
    <div>
      <HomeClient openNew={openNew}>
        <div className="flex border-b">
          <a href="/home?tab=all" className={`flex-1 py-2.5 text-sm font-medium text-center ${tab !== 'following' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
            みんなの投稿
          </a>
          <a href="/home?tab=following" className={`flex-1 py-2.5 text-sm font-medium text-center ${tab === 'following' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
            フォロー中
          </a>
        </div>
        {tab !== 'following' && (
          <>
            <Link
              href="/buy-sell"
              className="mx-3 my-2 px-4 py-3 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 dark:bg-muted/30 hover:bg-muted/60 dark:hover:bg-muted/50 active:bg-muted/70 active:scale-[0.99] transition-[background-color,transform] duration-75"
            >
              <ShoppingBag className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-foreground">フリマ</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">教科書・家具・日用品などを探す</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
            </Link>
            <Suspense fallback={null}><CategoryFilter /></Suspense>
            <Suspense fallback={null}><SortTabs /></Suspense>
          </>
        )}
        {/* おすすめユーザー（フォロー中タブかつフォロー0人のとき、またはみんなの投稿で最初に表示） */}
        {suggestedUsers.length > 0 && tab === 'following' && posts.length === 0 && (
          <SuggestedUsers users={suggestedUsers as never} />
        )}
        <Suspense fallback={<PostListSkeleton />}>
          <InfinitePostList initialPosts={posts as never} filter={filter} />
        </Suspense>
        {/* みんなの投稿タブ：投稿の前におすすめを表示 */}
        {suggestedUsers.length > 0 && tab !== 'following' && posts.length > 0 && posts.length <= 5 && (
          <SuggestedUsers users={suggestedUsers as never} />
        )}
      </HomeClient>
    </div>
  )
}
