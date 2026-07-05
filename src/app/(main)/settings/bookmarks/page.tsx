import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Bookmark } from 'lucide-react'
import { getBookmarkedPosts } from '@/lib/actions/bookmarks'
import { PostCard } from '@/components/posts/PostCard'

export const metadata: Metadata = { title: '保存した投稿' }
export const dynamic = 'force-dynamic'

export default async function BookmarkedPostsPage() {
  const bookmarkedPosts = await getBookmarkedPosts()

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-lg">保存した投稿</h1>
      </div>

      {bookmarkedPosts.length > 0 ? (
        bookmarkedPosts.map(post => post && (
          <PostCard
            key={(post as never as { id: string }).id}
            post={Object.assign({}, post, { bookmarked: true }) as never}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Bookmark className="h-12 w-12 opacity-30" />
          <p className="text-sm">保存した投稿がありません</p>
        </div>
      )}
    </div>
  )
}
