import Link from 'next/link'
import { ImageIcon } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { ITEM_CONDITION_LABELS, type Post } from '@/types'

interface Props {
  post: Post
}

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  like_new: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  fair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  poor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export function ListingCard({ post }: Props) {
  const isSold = !!post.sold_at
  const mainImage = post.images?.[0]
  const conditionLabel = post.item_condition
    ? ITEM_CONDITION_LABELS[post.item_condition] ?? post.item_condition
    : null
  const conditionColor = post.item_condition ? CONDITION_COLORS[post.item_condition] : ''

  return (
    <Link href={`/post/${post.id}`} className="block">
      <div className={cn(
        'rounded-xl border overflow-hidden transition-colors hover:border-primary/50',
        isSold && 'opacity-60'
      )}>
        {/* 画像エリア */}
        <div className="relative aspect-square bg-muted">
          {mainImage ? (
            <img
              src={mainImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-30" />
            </div>
          )}
          {/* 売り切れオーバーレイ */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white font-bold text-sm tracking-widest border-2 border-white px-3 py-1 rounded">
                SOLD
              </span>
            </div>
          )}
          {/* 複数画像インジケーター */}
          {(post.images?.length ?? 0) > 1 && (
            <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5">
              +{(post.images?.length ?? 0) - 1}
            </div>
          )}
        </div>

        {/* 情報エリア */}
        <div className="p-2.5 space-y-1">
          <p className="text-xs font-medium line-clamp-2 leading-tight">{post.title}</p>

          {/* 価格 */}
          <p className="text-base font-bold text-primary">
            {post.price != null ? `¥${post.price.toLocaleString()}` : '価格応相談'}
          </p>

          {/* 状態バッジ */}
          {conditionLabel && (
            <span className={cn(
              'inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium',
              conditionColor
            )}>
              {conditionLabel}
            </span>
          )}

          {/* 投稿者・時間 */}
          <p className="text-[10px] text-muted-foreground">
            {post.users?.nickname ?? '不明'} · {timeAgo(post.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}
