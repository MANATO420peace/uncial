'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchAll(query: string, universityId?: string) {
  if (!query.trim()) return { posts: [], reviews: [], users: [] }

  const supabase = await createClient()

  let postsQuery = supabase
    .from('posts')
    .select('*, users(id, nickname), universities(id, name)')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false })
    .limit(20)

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
