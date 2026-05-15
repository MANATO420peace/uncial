'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleBookmark(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id)
    revalidatePath('/profile')
    return { bookmarked: false }
  } else {
    await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
    revalidatePath('/profile')
    return { bookmarked: true }
  }
}

export async function getBookmarkedPosts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('bookmarks')
    .select('posts(*, users(id, nickname), universities(id, name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data?.map(b => b.posts).filter(Boolean) ?? []
}
