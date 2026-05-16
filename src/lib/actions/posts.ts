'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PostCategory, PostFilter } from '@/types'
import { createNotification } from './notifications'
import { awardPoints } from './points'

export async function getBuySellEligibility() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isUniversityEmail: false, hasAgreedTerms: false }

  const isUniversityEmail = user.email?.endsWith('.ac.jp') ?? false

  const { data } = await supabase
    .from('users')
    .select('buy_sell_terms_agreed_at')
    .eq('id', user.id)
    .single()

  return {
    isUniversityEmail,
    hasAgreedTerms: !!data?.buy_sell_terms_agreed_at,
  }
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: profile } = await supabase
    .from('users')
    .select('university_id, buy_sell_terms_agreed_at')
    .eq('id', user.id)
    .single()

  if (!profile?.university_id) {
    return { error: 'プロフィールで大学を設定してください' }
  }

  const category = formData.get('category') as PostCategory

  if (category === 'buy_sell') {
    const isUniversityEmail = user.email?.endsWith('.ac.jp') ?? false
    if (!isUniversityEmail) {
      return { error: '販売・購入カテゴリは大学のメールアドレス（.ac.jp）が必要です' }
    }
    if (formData.get('terms_agreed') !== 'true') {
      return { error: '利用規約に同意してください' }
    }
    if (!profile.buy_sell_terms_agreed_at) {
      await supabase
        .from('users')
        .update({ buy_sell_terms_agreed_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  }

  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const imagesJson = formData.get('images') as string | null
  const images = imagesJson ? JSON.parse(imagesJson) : []

  const location = (formData.get('location') as string) || null

  const { data, error } = await supabase.from('posts').insert({
    user_id: user.id,
    university_id: profile.university_id,
    category,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    tags,
    anonymous: formData.get('anonymous') === 'true',
    images,
    location,
  }).select().single()

  if (error) return { error: error.message }

  await awardPoints(user.id, 10)

  revalidatePath('/home')
  redirect(`/post/${data.id}`)
}

export async function getPosts(filter: PostFilter = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      *,
      users(id, nickname, university_id),
      universities(id, name)
    `)

  if (filter.university_id) {
    query = query.eq('university_id', filter.university_id)
  }
  if (filter.category) {
    query = query.eq('category', filter.category)
  }

  if (filter.sort === 'popular') {
    query = query.order('likes_count', { ascending: false })
  } else if (filter.sort === 'comments') {
    query = query.order('comments_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const offset = filter.offset ?? 0
  query = query.range(offset, offset + 19)

  const { data, error } = await query
  if (error) return { error: error.message, posts: [] }

  const { data: { user } } = await supabase.auth.getUser()
  if (user && data) {
    const postIds = data.map(p => p.id)
    const [{ data: likes }, { data: bookmarks }] = await Promise.all([
      supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds),
    ])

    const likedSet = new Set(likes?.map(l => l.post_id) ?? [])
    const bookmarkedSet = new Set(bookmarks?.map(b => b.post_id) ?? [])
    return { posts: data.map(p => ({ ...p, liked: likedSet.has(p.id), bookmarked: bookmarkedSet.has(p.id) })), error: null }
  }

  return { posts: data ?? [], error: null }
}

export async function getPost(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users(id, nickname),
      universities(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) return { post: null, error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const [{ data: like }, { data: bookmark }] = await Promise.all([
      supabase.from('likes').select('id').eq('user_id', user.id).eq('post_id', id).maybeSingle(),
      supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('post_id', id).maybeSingle(),
    ])
    return { post: { ...data, liked: !!like, bookmarked: !!bookmark }, error: null }
  }

  return { post: data, error: null }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
    revalidatePath('/home')
    return { liked: false }
  } else {
    await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
    if (post) await createNotification({ userId: post.user_id, actorId: user.id, type: 'like', postId })
    revalidatePath('/home')
    return { liked: true }
  }
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  const { error } = await supabase.from('posts')
    .update({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      tags,
    })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/post/${postId}`)
  redirect(`/post/${postId}`)
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/home')
  redirect('/home')
}
