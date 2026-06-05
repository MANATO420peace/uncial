import { Suspense } from 'react'
import { Metadata } from 'next'
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
