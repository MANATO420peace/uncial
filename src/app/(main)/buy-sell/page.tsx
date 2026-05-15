import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Plus } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import { PostList } from '@/components/posts/PostList'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: '販売・購入' }

export default async function BuySellPage() {
  const { posts } = await getPosts({ category: 'buy_sell', sort: 'new' })

  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h1 className="font-bold text-lg">販売・購入</h1>
        </div>
        <Link href="/buy-sell/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            出品する
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 opacity-30" />
          <p className="text-sm">まだ投稿がありません</p>
          <p className="text-xs">出品ボタンから最初の投稿をしてみましょう</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  )
}
