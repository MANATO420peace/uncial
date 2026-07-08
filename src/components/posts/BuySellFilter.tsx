'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ListingCard } from './ListingCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ITEM_CONDITION_LABELS } from '@/types'
import type { Post } from '@/types'

const ITEM_CATEGORIES = [
  '教科書・参考書',
  'ノート・プリント',
  'PC・タブレット',
  'スマートフォン',
  '家具・家電',
  '衣類・ファッション',
  'スポーツ・アウトドア',
  '自転車・乗り物',
  '食品・飲料',
  'その他',
]

const PRICE_RANGES = [
  { label: '〜500円', min: 0, max: 500 },
  { label: '500〜1,000円', min: 500, max: 1000 },
  { label: '1,000〜3,000円', min: 1000, max: 3000 },
  { label: '3,000〜10,000円', min: 3000, max: 10000 },
  { label: '10,000円〜', min: 10000, max: Infinity },
]

const DELIVERY_OPTIONS = [
  { value: 'handover', label: '手渡し' },
  { value: 'shipping', label: '郵送' },
  { value: 'both', label: 'どちらでも' },
]

const SORT_OPTIONS = [
  { value: 'new', label: '新着順' },
  { value: 'price_asc', label: '安い順' },
  { value: 'price_desc', label: '高い順' },
]

type SortKey = 'new' | 'price_asc' | 'price_desc'

interface Filters {
  categories: string[]
  priceRanges: number[] // PRICE_RANGES のインデックス
  conditions: string[]
  deliveries: string[]
  sort: SortKey
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  priceRanges: [],
  conditions: [],
  deliveries: [],
  sort: 'new',
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

interface Props {
  posts: Post[]
  showSold: boolean
}

export function BuySellFilter({ posts, showSold }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [open, setOpen] = useState(false)
  // ダイアログ内の一時フィルター（適用前）
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS)

  const activeCount =
    filters.categories.length +
    filters.priceRanges.length +
    filters.conditions.length +
    filters.deliveries.length

  const filtered = useMemo(() => {
    let result = posts.filter((p: Post) => showSold ? !!p.sold_at : !p.sold_at)

    if (filters.categories.length > 0) {
      result = result.filter(p =>
        filters.categories.includes((p as never as { item_category?: string }).item_category ?? '')
      )
    }
    if (filters.priceRanges.length > 0) {
      result = result.filter(p => {
        const price = p.price ?? 0
        return filters.priceRanges.some(i => {
          const r = PRICE_RANGES[i]
          return price >= r.min && price < r.max
        })
      })
    }
    if (filters.conditions.length > 0) {
      result = result.filter(p =>
        filters.conditions.includes(p.item_condition ?? '')
      )
    }
    if (filters.deliveries.length > 0) {
      result = result.filter(p =>
        filters.deliveries.includes((p as never as { delivery_method?: string }).delivery_method ?? '')
      )
    }

    // 並び替え
    if (filters.sort === 'price_asc') {
      result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (filters.sort === 'price_desc') {
      result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }

    return result
  }, [posts, filters, showSold])

  function openFilter() {
    setDraft(filters)
    setOpen(true)
  }

  function applyFilter() {
    setFilters(draft)
    setOpen(false)
  }

  function resetDraft() {
    setDraft(DEFAULT_FILTERS)
  }

  return (
    <>
      {/* フィルターバー */}
      <div className="flex items-center gap-2 px-3 py-2 border-b overflow-x-auto">
        {/* フィルターボタン */}
        <button
          onClick={openFilter}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
            activeCount > 0
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          絞り込み
          {activeCount > 0 && (
            <span className="bg-primary-foreground text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {/* 並び替え */}
        <div className="relative shrink-0">
          <select
            value={filters.sort}
            onChange={e => setFilters(f => ({ ...f, sort: e.target.value as SortKey }))}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border border-border bg-background text-muted-foreground hover:border-primary/50 cursor-pointer focus:outline-none"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        {/* アクティブフィルターのタグ表示 */}
        {filters.categories.map(c => (
          <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
            {c}
            <button onClick={() => setFilters(f => ({ ...f, categories: f.categories.filter(x => x !== c) }))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {filters.priceRanges.map(i => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
            {PRICE_RANGES[i].label}
            <button onClick={() => setFilters(f => ({ ...f, priceRanges: f.priceRanges.filter(x => x !== i) }))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {filters.conditions.map(c => (
          <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
            {ITEM_CONDITION_LABELS[c as keyof typeof ITEM_CONDITION_LABELS]}
            <button onClick={() => setFilters(f => ({ ...f, conditions: f.conditions.filter(x => x !== c) }))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {filters.deliveries.map(d => (
          <span key={d} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
            {DELIVERY_OPTIONS.find(o => o.value === d)?.label}
            <button onClick={() => setFilters(f => ({ ...f, deliveries: f.deliveries.filter(x => x !== d) }))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* 件数 */}
      <div className="px-4 py-2 text-xs text-muted-foreground">
        {filtered.length}件
      </div>

      {/* グリッド */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <p className="text-sm">条件に合う出品がありません</p>
          {activeCount > 0 && (
            <button
              className="text-xs text-primary underline"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              絞り込みをリセット
            </button>
          )}
        </div>
      ) : (
        <div className="p-3 grid grid-cols-2 gap-3">
          {filtered.map((post: Post) => (
            <ListingCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* フィルターダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>絞り込み</DialogTitle>
              <button
                onClick={resetDraft}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                リセット
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* カテゴリ */}
            <div>
              <p className="text-sm font-semibold mb-2.5">商品カテゴリ</p>
              <div className="flex flex-wrap gap-2">
                {ITEM_CATEGORIES.map(cat => (
                  <ChipButton
                    key={cat}
                    active={draft.categories.includes(cat)}
                    onClick={() => setDraft(d => ({ ...d, categories: toggle(d.categories, cat) }))}
                  >
                    {cat}
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* 価格帯 */}
            <div>
              <p className="text-sm font-semibold mb-2.5">価格帯</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((r, i) => (
                  <ChipButton
                    key={i}
                    active={draft.priceRanges.includes(i)}
                    onClick={() => setDraft(d => ({ ...d, priceRanges: toggle(d.priceRanges, i) }))}
                  >
                    {r.label}
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* 商品の状態 */}
            <div>
              <p className="text-sm font-semibold mb-2.5">商品の状態</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ITEM_CONDITION_LABELS).map(([val, label]) => (
                  <ChipButton
                    key={val}
                    active={draft.conditions.includes(val)}
                    onClick={() => setDraft(d => ({ ...d, conditions: toggle(d.conditions, val) }))}
                  >
                    {label}
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* 受け渡し方法 */}
            <div>
              <p className="text-sm font-semibold mb-2.5">受け渡し方法</p>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_OPTIONS.map(o => (
                  <ChipButton
                    key={o.value}
                    active={draft.deliveries.includes(o.value)}
                    onClick={() => setDraft(d => ({ ...d, deliveries: toggle(d.deliveries, o.value) }))}
                  >
                    {o.label}
                  </ChipButton>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full" onClick={applyFilter}>
              適用する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
