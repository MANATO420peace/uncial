'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostCard } from '@/components/posts/PostCard'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import type { Post, CourseReview, University } from '@/types'

const CATEGORY_CHIPS = [
  { value: 'all',          label: 'すべて' },
  { value: 'chat',         label: '雑談'   },
  { value: 'course',       label: '履修'   },
  { value: 'test_homework',label: 'テスト' },
  { value: 'circle',       label: 'サークル'},
  { value: 'part_time',    label: 'バイト' },
  { value: 'seminar',      label: 'ゼミ'   },
  { value: 'job_hunting',  label: '就活'   },
  { value: 'buy_sell',     label: '売買'   },
]

const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 6

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}
function saveHistory(q: string) {
  try {
    const h = loadHistory().filter(s => s !== q)
    localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...h].slice(0, MAX_HISTORY)))
  } catch {}
}
function removeHistory(q: string) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(loadHistory().filter(s => s !== q)))
  } catch {}
}

interface Props {
  query: string
  results: {
    posts: Post[]
    reviews: CourseReview[]
    users: { id: string; nickname: string; avatar_url?: string | null; universities?: { name: string } | null }[]
  }
  universities: University[]
  selectedUniversityId: string
  selectedCategory: string
  selectedSort: 'new' | 'popular'
  popularTags: string[]
}

export function SearchClient({
  query, results, universities,
  selectedUniversityId, selectedCategory, selectedSort, popularTags,
}: Props) {
  const router = useRouter()
  const [input, setInput] = useState(query)
  // selectedUniversityIdがリストに存在しない場合はallにフォールバック
  const validUniversityId = selectedUniversityId && universities.some(u => u.id === selectedUniversityId)
    ? selectedUniversityId
    : ''
  const [universityId, setUniversityId] = useState(validUniversityId)
  const [category, setCategory] = useState(selectedCategory || 'all')
  const [sort, setSort] = useState<'new' | 'popular'>(selectedSort)
  const [history, setHistory] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setHistory(loadHistory()) }, [])

  const buildUrl = useCallback((q: string, uid: string, cat: string, s: string) => {
    const params = new URLSearchParams()
    if (q)  params.set('q', q)
    if (uid) params.set('university_id', uid)
    if (cat && cat !== 'all') params.set('category', cat)
    if (s && s !== 'new') params.set('sort', s)
    return `/search?${params.toString()}`
  }, [])

  function navigate(q: string, uid: string, cat: string, s: string) {
    if (q.trim()) saveHistory(q.trim())
    setHistory(loadHistory())
    startTransition(() => router.push(buildUrl(q, uid, cat, s)))
  }

  // デバウンス検索
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!input.trim()) return
    debounceRef.current = setTimeout(() => {
      navigate(input.trim(), universityId, category, sort)
    }, 450)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!input.trim()) return
    navigate(input.trim(), universityId, category, sort)
  }

  function handleClear() {
    setInput('')
    router.push('/search')
  }

  function handleHistoryClick(q: string) {
    setInput(q)
    navigate(q, universityId, category, sort)
  }

  function handleHistoryRemove(q: string, e: React.MouseEvent) {
    e.stopPropagation()
    removeHistory(q)
    setHistory(loadHistory())
  }

  function handleTagClick(tag: string) {
    const q = `#${tag}`
    setInput(q)
    navigate(q, universityId, category, sort)
  }

  function handleUniversityChange(value: string) {
    const uid = value === 'all' ? '' : value
    setUniversityId(uid)
    if (input.trim()) navigate(input.trim(), uid, category, sort)
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    if (input.trim()) navigate(input.trim(), universityId, cat, sort)
  }

  function handleSortChange(s: 'new' | 'popular') {
    setSort(s)
    if (input.trim()) navigate(input.trim(), universityId, category, s)
  }

  return (
    <div>
      {/* 検索バー */}
      <div className="sticky top-14 z-10 bg-background border-b px-4 py-3 space-y-2">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="投稿・ユーザー・授業名を検索"
              className="pl-9 pr-8"
              autoFocus
            />
            {input && (
              <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <Select value={universityId || 'all'} onValueChange={handleUniversityChange}>
          <SelectTrigger className="h-8 text-xs">
            <span className="text-xs">
              {universityId ? (universities.find(u => u.id === universityId)?.name ?? 'すべての大学') : 'すべての大学'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての大学</SelectItem>
            {universities.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 検索前: 履歴 + 人気タグ */}
      {!query ? (
        <div className="px-4 py-4 space-y-5">
          {history.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">最近の検索</p>
              <ul className="space-y-0.5">
                {history.map(h => (
                  <li key={h}>
                    <button
                      onClick={() => handleHistoryClick(h)}
                      className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2 text-sm min-w-0">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{h}</span>
                      </span>
                      <button
                        onClick={(e) => handleHistoryRemove(h, e)}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {popularTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">人気のタグ</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="text-xs bg-muted hover:bg-primary/10 hover:text-primary text-foreground px-3 py-1.5 rounded-full transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.length === 0 && popularTags.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-1">
              <Search className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">キーワードまたは #タグ で検索</p>
            </div>
          )}
        </div>
      ) : (
        // 検索結果
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full rounded-none border-b h-10 bg-transparent px-4 justify-start gap-6">
            <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-0 text-sm">
              投稿 {results.posts.length > 0 && `(${results.posts.length})`}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-0 text-sm">
              ユーザー {results.users.length > 0 && `(${results.users.length})`}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-0 text-sm">
              授業 {results.reviews.length > 0 && `(${results.reviews.length})`}
            </TabsTrigger>
          </TabsList>

          {/* 投稿タブ: カテゴリ + ソート */}
          <TabsContent value="posts" className="mt-0">
            <div className="px-4 py-2 border-b space-y-2">
              {/* カテゴリチップ */}
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {CATEGORY_CHIPS.map(chip => (
                  <button
                    key={chip.value}
                    onClick={() => handleCategoryChange(chip.value)}
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full transition-colors ${
                      category === chip.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              {/* ソート */}
              <div className="flex gap-1">
                {(['new', 'popular'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSortChange(s)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                      sort === s
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s === 'new' ? '新着順' : '人気順'}
                  </button>
                ))}
              </div>
            </div>

            {isPending ? (
              <p className="text-center py-8 text-sm text-muted-foreground">検索中...</p>
            ) : results.posts.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">「{query}」の投稿が見つかりませんでした</p>
            ) : (
              results.posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>

          {/* ユーザータブ */}
          <TabsContent value="users" className="mt-0">
            {results.users.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">「{query}」のユーザーが見つかりませんでした</p>
            ) : (
              <ul>
                {results.users.map(user => (
                  <li key={user.id}>
                    <Link href={`/user/${user.id}`} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50 transition-colors">
                      <Avatar className="h-11 w-11 shrink-0">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {user.nickname[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user.nickname}</p>
                        {user.universities?.name && (
                          <p className="text-xs text-muted-foreground">{user.universities.name}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* 授業タブ */}
          <TabsContent value="reviews" className="mt-0">
            {results.reviews.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">「{query}」のレビューが見つかりませんでした</p>
            ) : (
              results.reviews.map(review => <ReviewCard key={review.id} review={review} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
