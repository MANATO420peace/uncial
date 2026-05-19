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

  let postsQuery = supabase
    .from('posts')
    .select('*, users(id, nickname), universities(id, name)')
    .order('created_at', { ascending: false })
    .limit(20)

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

  return {
    posts: postsResult.data ?? [],
    reviews: reviewsResult.data ?? [],
    users: usersResult.data ?? [],
  }
}
