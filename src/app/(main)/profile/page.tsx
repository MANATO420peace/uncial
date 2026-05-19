import { Metadata } from 'next'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getLikedPosts } from '@/lib/actions/user'
import { getBookmarkedPosts } from '@/lib/actions/bookmarks'
import { getFollowRequests, getFollowStats } from '@/lib/actions/follow'
import { getMyPoints } from '@/lib/actions/points'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/posts/PostCard'
import { FollowRequestList } from '@/components/users/FollowRequestList'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'プロフィール' }

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const [{ data: posts }, bookmarkedPosts, likedPosts, followRequests, { points, badge }, followStats] = await Promise.all([
    supabase
      .from('posts')
      .select('*, universities(id, name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    getBookmarkedPosts(),
    getLikedPosts(),
    user.is_private ? getFollowRequests() : Promise.resolve([]),
    getMyPoints(),
    getFollowStats(user.id),
  ])

  return (
    <div>
      <div className="px-4 py-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <Avatar className="h-14 w-14">
            {user.avatar_url && <AvatarImage src={user.avatar_url} />}
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {user.nickname[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link href="/settings" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            <Settings className="h-4 w-4 mr-1" />
            編集
          </Link>
        </div>

        <h1 className="font-bold text-lg">{user.nickname}</h1>

        {user.bio && (
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{user.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {(user as { universities?: { name: string } }).universities?.name && (
            <Badge variant="secondary" className="text-xs">
              {(user as { universities?: { name: string } }).universities?.name}
            </Badge>
          )}
          {user.faculty && (
            <Badge variant="secondary" className="text-xs">{user.faculty}</Badge>
          )}
          {user.grade && (
            <Badge variant="secondary" className="text-xs">{user.grade}</Badge>
          )}
          {user.is_private && (
            <Badge variant="outline" className="text-xs">非公開</Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1">
            <span>🏅</span>{badge.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mt-2">{points} ポイント</p>

        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="font-bold">{posts?.length ?? 0}</span>
            <span className="text-muted-foreground ml-1">投稿</span>
          </div>
          <Link href={`/user/${user.id}/followers`} className="hover:underline">
            <span className="font-bold">{followStats.followersCount}</span>
            <span className="text-muted-foreground ml-1">フォロワー</span>
          </Link>
          <Link href={`/user/${user.id}/following`} className="hover:underline">
            <span className="font-bold">{followStats.followingCount}</span>
            <span className="text-muted-foreground ml-1">フォロー中</span>
          </Link>
        </div>
      </div>

      {followRequests.length > 0 && (
        <FollowRequestList requests={followRequests as never} />
      )}

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full rounded-none border-b h-10 bg-transparent px-4 justify-start gap-6">
          <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-0 text-sm">
            投稿
          </TabsTrigger>
          <TabsTrigger value="liked" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-0 text-sm">
            いいね
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-0 text-sm">
            保存済み
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts && posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post as never} isOwner={true} />)
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">まだ投稿がありません</p>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-0">
          {likedPosts.length > 0 ? (
            likedPosts.map(post => post && <PostCard key={(post as never as { id: string }).id} post={post as never} />)
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">いいねした投稿がありません</p>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-0">
          {bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map(post => post && <PostCard key={(post as never as { id: string }).id} post={Object.assign({}, post, { bookmarked: true }) as never} />)
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">保存した投稿はありません</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
