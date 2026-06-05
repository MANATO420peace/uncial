'use server'

import { createClient } from '@/lib/supabase/server'
import { getBlockedAndMutedIds } from './block'

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

export async function searchAll(
  query: string,
  universityId?: string,
  category?: string,
  sort: 'new' | 'popular' = 'new',
) {
  if (!query.trim()) return { posts: [], reviews: [], users: [] }

  const supabase = await createClient()
  const isTagSearch = query.startsWith('#')
  const cleanQuery = isTagSearch ? query.slice(1) : query

  const { data: { user } } = await supabase.auth.getUser()

  // ブロック・ミュートユーザーと、フォロー中ユーザーを並行取得
  const [{ blockedIds, mutedIds }, followsResult] = await Promise.all([
    getBlockedAndMutedIds(),
    user
      ? supabase.from('follows').select('following_id').eq('follower_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const excludeIds = new Set([...blockedIds, ...mutedIds])
  const followingIds = followsResult.data?.map(f => f.following_id) ?? []

  // 投稿検索
  let postsQuery = supabase
    .from('posts')
    .select('*, users(id, nickname, is_private), universities(id, name)')
    .limit(60)

  if (sort === 'popular') {
    postsQuery = postsQuery.order('likes_count', { ascending: false })
  } else {
    postsQuery = postsQuery.order('created_at', { ascending: false })
  }

  if (isTagSearch) {
    postsQuery = postsQuery.contains('tags', [cleanQuery])
  } else {
    postsQuery = postsQuery.or(`title.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%`)
  }

  if (universityId) postsQuery = postsQuery.eq('university_id', universityId)
  if (category && category !== 'all') postsQuery = postsQuery.eq('category', category)

  // レビュー検索
  let reviewsQuery = supabase
    .from('course_reviews')
    .select('*, universities(id, name)')
    .or(`course_name.ilike.%${query}%,professor_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(15)

  if (universityId) reviewsQuery = reviewsQuery.eq('university_id', universityId)

  // ユーザー検索
  let usersQuery = supabase
    .from('users')
    .select('id, nickname, university_id, avatar_url, universities(name)')
    .ilike('nickname', `%${query}%`)
    .limit(15)

  if (universityId) usersQuery = usersQuery.eq('university_id', universityId)

  const [postsResult, reviewsResult, usersResult] = await Promise.all([
    postsQuery,
    reviewsQuery,
    usersQuery,
  ])

  // ブロック・非公開フィルター
  const filteredPosts = (postsResult.data ?? []).filter(post => {
    const poster = post.users as { id: string; is_private?: boolean } | null
    if (excludeIds.has(post.user_id)) return false
    if (!poster?.is_private) return true
    if (user && poster.id === user.id) return true
    if (followingIds.includes(poster.id)) return true
    return false
  }).slice(0, 20)

  // ブロックユーザーをユーザー一覧からも除外
  const filteredUsers = (usersResult.data ?? []).filter(u => !excludeIds.has(u.id))

  return {
    posts: filteredPosts,
    reviews: reviewsResult.data ?? [],
    users: filteredUsers,
  }
}
