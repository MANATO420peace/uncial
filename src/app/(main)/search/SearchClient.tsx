'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PostCard } from '@/components/posts/PostCard'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import type { Post, CourseReview } from '@/types'

interface Props {
  query: string
  results: {
    posts: Post[]
    reviews: CourseReview[]
    users: { id: string; nickname: string; universities?: { name: string } | null }[]
  }
}

export function SearchClient({ query, results }: Props) {
  const router = useRouter()
  const [input, setInput] = useState(query)
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`)
    })
  }

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background border-b px-4 py-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="投稿・ユーザー・授業名を検索"
              className="pl-9"
              autoFocus
            />
          </div>
        </form>
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-1">
          <Search className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">キーワードを入力して検索</p>
        </div>
      ) : (
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

          <TabsContent value="posts" className="mt-0">
            {isPending ? (
              <p className="text-center py-8 text-sm text-muted-foreground">検索中...</p>
            ) : results.posts.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">「{query}」の投稿が見つかりませんでした</p>
            ) : (
              results.posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            {results.users.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">「{query}」のユーザーが見つかりませんでした</p>
            ) : (
              <ul>
                {results.users.map(user => (
                  <li key={user.id}>
                    <Link href={`/user/${user.id}`} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
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
