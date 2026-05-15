'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchAll(query: string) {
  if (!query.trim()) return { posts: [], reviews: [], users: [] }

  const supabase = await createClient()

  const [postsResult, reviewsResult, usersResult] = await Promise.all([
    supabase
      .from('posts')
      .select('*, users(id, nickname), universities(id, name)')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('course_reviews')
      .select('*, universities(id, name)')
      .or(`course_name.ilike.%${query}%,professor_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('users')
      .select('id, nickname, university_id, universities(name)')
      .ilike('nickname', `%${query}%`)
      .limit(10),
  ])

  return {
    posts: postsResult.data ?? [],
    reviews: reviewsResult.data ?? [],
    users: usersResult.data ?? [],
  }
}
