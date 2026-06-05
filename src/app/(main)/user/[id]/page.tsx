import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Lock, ShieldBan } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/actions/user'
import { getFollowStats } from '@/lib/actions/follow'
import { getBlockMuteStatus } from '@/lib/actions/block'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/posts/PostCard'
import { FollowButton } from '@/components/users/FollowButton'
import { DMButton } from '@/components/users/DMButton'
import { UserActionMenu } from '@/components/users/UserActionMenu'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('nickname').eq('id', id).single()
  return { title: data?.nickname ?? 'ユーザー' }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: profile }, currentUser, followStats] = await Promise.all([
    supabase.from('users').select('*, universities(id, name)').eq('id', id).single(),
    getCurrentUser(),
    getFollowStats(id),
  ])

  if (!profile) notFound()

  const isOwnProfile = currentUser?.id === id

  // ブロック・ミュート状態を取得
  const blockMuteStatus = (!isOwnProfile && currentUser)
    ? await getBlockMuteStatus(id)
    : { isBlocked: false, isMuted: false, isBlockedByThem: false }

  // 相手にブロックされている場合はコンテンツを非表示
  if (blockMuteStatus.isBlockedByThem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <ShieldBan className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">このコンテンツは表示できません</p>
      </div>
    )
  }

  const isPrivate = profile.is_private && !followStats.isFollowing && !isOwnProfile

  const { data: posts } = isPrivate ? { data: null } : await supabase
    .from('posts')
    .select('*, universities(id, name)')
    .eq('user_id', id)
    .eq('anonymous', false)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div>
      <div className="px-4 py-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <Avatar className="h-14 w-14">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {profile.nickname[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isOwnProfile && currentUser && (
            <div className="flex items-center gap-2">
              {!blockMuteStatus.isBlocked && <DMButton targetUserId={id} />}
              {!blockMuteStatus.isBlocked && (
                <FollowButton
                  targetUserId={id}
                  initialFollowing={followStats.isFollowing}
                  initialRequestPending={followStats.hasPendingRequest}
                />
              )}
              <UserActionMenu
                targetUserId={id}
                initialBlocked={blockMuteStatus.isBlocked}
                initialMuted={blockMuteStatus.isMuted}
                targetNickname={profile.nickname}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg">{profile.nickname}</h1>
          {profile.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
          {blockMuteStatus.isBlocked && (
            <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">ブロック中</span>
          )}
          {blockMuteStatus.isMuted && !blockMuteStatus.isBlocked && (
            <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">ミュート中</span>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {(profile as { universities?: { name: string } }).universities?.name && (
            <Badge variant="secondary" className="text-xs">
              {(profile as { universities?: { name: string } }).universities?.name}
            </Badge>
          )}
          {profile.faculty && (
            <Badge variant="secondary" className="text-xs">{profile.faculty}</Badge>
          )}
          {profile.grade && (
            <Badge variant="secondary" className="text-xs">{profile.grade}</Badge>
          )}
        </div>

        <div className="mt-4 flex gap-6 text-sm">
          {!isPrivate && (
            <div>
              <span className="font-bold">{posts?.length ?? 0}</span>
              <span className="text-muted-foreground ml-1">投稿</span>
            </div>
          )}
          <Link href={`/user/${id}/followers`} className="hover:underline">
            <span className="font-bold">{followStats.followersCount}</span>
            <span className="text-muted-foreground ml-1">フォロワー</span>
          </Link>
          <Link href={`/user/${id}/following`} className="hover:underline">
            <span className="font-bold">{followStats.followingCount}</span>
            <span className="text-muted-foreground ml-1">フォロー中</span>
          </Link>
        </div>
      </div>

      {blockMuteStatus.isBlocked ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <ShieldBan className="h-8 w-8 opacity-30" />
          <p className="text-sm">このユーザーをブロックしています</p>
        </div>
      ) : isPrivate ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Lock className="h-8 w-8 opacity-30" />
          <p className="text-sm font-medium">このアカウントは非公開です</p>
          <p className="text-xs">フォローしてコンテンツを見てみましょう</p>
        </div>
      ) : (
        <div>
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">投稿</h2>
          </div>
          {posts && posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post as never} />)
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">まだ投稿がありません</p>
          )}
        </div>
      )}
    </div>
  )
}
