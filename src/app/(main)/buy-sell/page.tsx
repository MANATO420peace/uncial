import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Plus } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/actions/user'
import { BuySellFilter } from '@/components/posts/BuySellFilter'
import { Button } from '@/components/ui/button'
import type { Post } from '@/types'

export const metadata: Metadata = { title: '販売・購入' }

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function BuySellPage({ searchParams }: Props) {
  const { status } = await searchParams
  const showSold = status === 'sold'

  const user = await getCurrentUser()
  const universityId = user?.university_id ?? undefined

  const { posts } = await getPosts({
    category: 'buy_sell',
    sort: 'new',
    university_id: universityId,
  } as never)

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

      {/* フィルター + グリッド */}
      <BuySellFilter posts={posts as Post[]} showSold={showSold} />
    </div>
  )
}
