import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Plus } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/actions/user'
import { ListingCard } from '@/components/posts/ListingCard'
import { Button } from '@/components/ui/button'
import type { Post } from '@/types'

export const metadata: Metadata = { title: '販売・購入' }

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function BuySellPage({ searchParams }: Props) {
  const { status } = await searchParams
  const showSold = status === 'sold'

  // ログインユーザーの大学IDを取得し、同じ大学の出品のみ表示
  const user = await getCurrentUser()
  const universityId = user?.university_id ?? undefined

  const { posts } = await getPosts({
    category: 'buy_sell',
    sort: 'new',
    university_id: universityId,
  } as never)

  const filtered = showSold
    ? posts.filter((p: Post) => !!p.sold_at)
    : posts.filter((p: Post) => !p.sold_at)

  const universityName = (user as { universities?: { name: string } | null } | null)?.universities?.name

  return (
    <div>
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h1 className="font-bold text-lg">販売・購入</h1>
          </div>
          {universityName && (
            <p className="text-xs text-muted-foreground mt-0.5">{universityName}の出品のみ表示</p>
          )}
        </div>
        <Link href="/buy-sell/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            出品する
          </Button>
        </Link>
      </div>

      {/* タブ: 販売中 / 売り切れ */}
      <div className="flex border-b">
        <Link
          href="/buy-sell"
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            !showSold
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          販売中
        </Link>
        <Link
          href="/buy-sell?status=sold"
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            showSold
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          売り切れ
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 opacity-30" />
          <p className="text-sm">
            {showSold ? '売り切れの商品はありません' : 'まだ出品がありません'}
          </p>
          {!showSold && (
            <p className="text-xs">出品ボタンから最初の投稿をしてみましょう</p>
          )}
        </div>
      ) : (
        <div className="p-3 grid grid-cols-2 gap-3">
          {filtered.map((post: Post) => (
            <ListingCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
