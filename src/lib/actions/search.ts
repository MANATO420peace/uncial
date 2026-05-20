'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPopularTags(limit = 15) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('tags')
    .not('tags', 'is', null)
    .order('created_at', { ascending: false })
    .limit(300)

  const counts = new Map<string, number>()
  data?.forEach(post => {
    (post.tags as string[] | null)?.forEach(tag => {
      if (tag) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    })
  })

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag)
}

export async function searchAll(query: string, universityId?: string) {
  if (!query.trim()) return { posts: [], reviews: [], users: [] }

  const supabase = await createClient()
  const isTagSearch = query.startsWith('#')
  const cleanQuery = isTagSearch ? query.slice(1) : query

  // 現在のユーザーを取得（非公開アカウントのフィルタリング用）
  const { data: { user } } = await supabase.auth.getUser()

  // 現在のユーザーがフォローしているユーザーIDの一覧を取得
  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    followingIds = follows?.map(f => f.following_id) ?? []
  }

  let postsQuery = supabase
    .from('posts')
    .select('*, users(id, nickname, is_private), universities(id, name)')
    .order('created_at', { ascending: false })
    .limit(50) // 後でフィルタするので多めに取得

  if (isTagSearch) {
    postsQuery = postsQuery.contains('tags', [cleanQuery])
  } else {
    postsQuery = postsQuery.or(`title.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  if (universityId) postsQuery = postsQuery.eq('university_id', universityId)

  let reviewsQuery = supabase
    .from('course_reviews')
    .select('*, universities(id, name)')
    .or(`course_name.ilike.%${query}%,professor_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (universityId) reviewsQuery = reviewsQuery.eq('university_id', universityId)

  let usersQuery = supabase
    .from('users')
    .select('id, nickname, university_id, universities(name)')
    .ilike('nickname', `%${query}%`)
    .limit(10)

  if (universityId) usersQuery = usersQuery.eq('university_id', universityId)

  const [postsResult, reviewsResult, usersResult] = await Promise.all([
    postsQuery,
    reviewsQuery,
    usersQuery,
  ])

  // 非公開アカウントの投稿をフィルタリング:
  // - 自分の投稿は常に表示
  // - フォローしているユーザーの投稿は表示
  // - 非公開アカウントのそれ以外の投稿は非表示
  const allPosts = postsResult.data ?? []
  const filteredPosts = allPosts.filter(post => {
    const poster = post.users as { id: string; nickname: string; is_private?: boolean } | null
    if (!poster) return true // ユーザー情報がなければ表示
    if (!poster.is_private) return true // 公開アカウントは表示
    if (user && poster.id === user.id) return true // 自分の投稿は表示
    if (followingIds.includes(poster.id)) return true // フォロー中なら表示
    return false // 非公開アカウントの投稿は非表示
  }).slice(0, 20)

  return {
    posts: filteredPosts,
    reviews: reviewsResult.data ?? [],
    users: usersResult.data ?? [],
  }
}
