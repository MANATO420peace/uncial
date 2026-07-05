import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Heart } from 'lucide-react'
import { getLikedPosts } from '@/lib/actions/user'
import { PostCard } from '@/components/posts/PostCard'

export const metadata: Metadata = { title: 'いいねした投稿' }
export const dynamic = 'force-dynamic'

export default async function LikedPostsPage() {
  const likedPosts = await getLikedPosts()

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-lg">いいねした投稿</h1>
      </div>

      {likedPosts.length > 0 ? (
        likedPosts.map(post => post && (
          <PostCard key={(post as never as { id: string }).id} post={post as never} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Heart className="h-12 w-12 opacity-30" />
          <p className="text-sm">いいねした投稿がありません</p>
        </div>
      )}
    </div>
  )
}
