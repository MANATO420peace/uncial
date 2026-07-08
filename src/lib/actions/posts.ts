'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PostCategory, PostFilter } from '@/types'
import { createNotification } from './notifications'
import { notifyPostFollowers } from './postNotifications'
import { getBlockedAndMutedIds } from './block'

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

  // レート制限: 60秒に1投稿まで
  const { data: recentPost } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 60_000).toISOString())
    .limit(1)
    .maybeSingle()

  if (recentPost) return { error: '投稿は1分に1回までです。少し待ってから再度お試しください。' }

  const category = formData.get('category') as PostCategory

  if (category === 'buy_sell') {
    // 一時的に本人確認チェックを無効化
    // const isUniversityEmail = user.email?.endsWith('.ac.jp') ?? false
    // if (!isUniversityEmail) {
    //   return { error: '販売・購入カテゴリは大学のメールアドレス（.ac.jp）が必要です' }
    // }
    if (!profile.buy_sell_terms_agreed_at) {
      await supabase
        .from('users')
        .update({ buy_sell_terms_agreed_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  }

  const tagsRaw = formData.get('tags') as string
  const manualTags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const content = formData.get('content') as string
  const hashtagsFromContent = (content.match(/#[\p{L}\p{N}_]+/gu) ?? []).map(t => t.slice(1))
  const tags = [...new Set([...manualTags, ...hashtagsFromContent])]

  const imagesJson = formData.get('images') as string | null
  const images = imagesJson ? JSON.parse(imagesJson) : []

  const location = (formData.get('location') as string) || null

  // 販売・購入専用フィールド
  const priceRaw = formData.get('price') as string | null
  const price = priceRaw ? parseInt(priceRaw, 10) : null
  const item_condition = (formData.get('item_condition') as string) || null
  const item_category = (formData.get('item_category') as string) || null
  const delivery_method = (formData.get('delivery_method') as string) || null
  const price_negotiable = formData.get('price_negotiable') === 'true'

  const { data, error } = await supabase.from('posts').insert({
    user_id: user.id,
    university_id: profile.university_id,
    category,
    title: formData.get('title') as string,
    content,
    tags,
    anonymous: formData.get('anonymous') === 'true',
    images,
    location,
    ...(category === 'buy_sell' ? { price, item_condition, item_category, delivery_method, price_negotiable } : {}),
  }).select().single()

  if (error) return { error: error.message }

  // 投稿通知をONにしているユーザーへ通知
  notifyPostFollowers(user.id, data.id, data.title, category === 'buy_sell').catch(() => {})

  revalidatePath('/home')
  redirect(`/post/${data.id}`)
}

export async function markAsSold(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = supabase }

  const { error } = await db
    .from('posts')
    .update({ sold_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/post/${postId}`)
  revalidatePath('/buy-sell')
  return { error: null }
}

export async function markAsAvailable(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = supabase }

  const { error } = await db
    .from('posts')
    .update({ sold_at: null })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/post/${postId}`)
  revalidatePath('/buy-sell')
  return { error: null }
}

export async function getPosts(filter: PostFilter = {}) {
  const supabase = await createClient()

  // ブロック・ミュートユーザーをフィードから除外
  const { blockedIds, mutedIds } = await getBlockedAndMutedIds()
  const excludeIds = [...new Set([...blockedIds, ...mutedIds])]

  let query = supabase
    .from('posts')
    .select(`
      *,
      users(id, nickname, university_id),
      universities(id, name)
    `)

  // 匿名投稿はuser_idを持つが匿名として表示。ブロック対象はuser_idで除外
  if (excludeIds.length > 0) {
    query = query.not('user_id', 'in', `(${excludeIds.join(',')})`)
  }

  // buy_sell はホームフィードから除外（カテゴリ指定がない場合のみ）
  if (!filter.category) {
    query = query.neq('category', 'buy_sell')
  }

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
  const postIds = data?.map(p => p.id) ?? []

  // likesテーブルから正確なカウントを取得（likes_countキャッシュは不正確なことがあるため）
  const { data: allLikesData } = await supabase
    .from('likes')
    .select('post_id')
    .in('post_id', postIds)

  const realCountMap = new Map<string, number>()
  allLikesData?.forEach(l => {
    realCountMap.set(l.post_id, (realCountMap.get(l.post_id) ?? 0) + 1)
  })

  if (user && data) {
    const [{ data: myLikes }, { data: bookmarks }] = await Promise.all([
      supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds),
    ])

    const likedSet = new Set(myLikes?.map(l => l.post_id) ?? [])
    const bookmarkedSet = new Set(bookmarks?.map(b => b.post_id) ?? [])
    return {
      posts: data.map(p => ({
        ...p,
        likes_count: realCountMap.get(p.id) ?? p.likes_count ?? 0,
        liked: likedSet.has(p.id),
        bookmarked: bookmarkedSet.has(p.id),
      })),
      error: null,
    }
  }

  return {
    posts: (data ?? []).map(p => ({
      ...p,
      likes_count: realCountMap.get(p.id) ?? p.likes_count ?? 0,
    })),
    error: null,
  }
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

  // likesテーブルから正確なカウントを取得
  const { count: realCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id)

  if (user) {
    const [{ data: like }, { data: bookmark }] = await Promise.all([
      supabase.from('likes').select('id').eq('user_id', user.id).eq('post_id', id).maybeSingle(),
      supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('post_id', id).maybeSingle(),
    ])
    return { post: { ...data, likes_count: realCount ?? data.likes_count ?? 0, liked: !!like, bookmarked: !!bookmark }, error: null }
  }

  return { post: { ...data, likes_count: realCount ?? data.likes_count ?? 0 }, error: null }
}

export async function incrementPostView(postId: string) {
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = await createClient() }
  const { data } = await db.from('posts').select('views_count').eq('id', postId).single()
  if (data !== null) {
    await db.from('posts')
      .update({ views_count: ((data as { views_count?: number | null }).views_count ?? 0) + 1 })
      .eq('id', postId)
  }
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

  // likes_countの更新はadminクライアントで行う
  // RLSでは自分の投稿しか更新できないため、他ユーザーの投稿のlikes_countが更新されない問題を修正
  let admin: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { admin = createAdminClient() } catch { admin = supabase }

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
    const { count } = await supabase
      .from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId)
    await admin.from('posts').update({ likes_count: count ?? 0 }).eq('id', postId)
    revalidatePath('/home')
    return { liked: false, likesCount: count ?? 0 }
  } else {
    await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
    const { count } = await supabase
      .from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId)
    await admin.from('posts').update({ likes_count: count ?? 0 }).eq('id', postId)
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
    if (post) {
      await createNotification({ userId: post.user_id, actorId: user.id, type: 'like', postId })
    }
    revalidatePath('/home')
    return { liked: true, likesCount: count ?? 0 }
  }
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // admin client が使えればRLSを回避、使えなければ通常クライアントで試みる
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = supabase }

  const tagsRaw = formData.get('tags') as string
  const manualTags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const editContent = formData.get('content') as string
  const hashtagsFromContent = (editContent.match(/#[\p{L}\p{N}_]+/gu) ?? []).map(t => t.slice(1))
  const tags = [...new Set([...manualTags, ...hashtagsFromContent])]

  // user_id 条件を必ず付けて所有権チェック兼RLS対応
  const { error } = await db.from('posts')
    .update({
      title: formData.get('title') as string,
      content: editContent,
      tags,
    })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[updatePost] error:', error.message)
    return { error: error.message }
  }

  revalidatePath(`/post/${postId}`)
  revalidatePath('/home')
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // admin client が使えればRLSを回避、使えなければ通常クライアントで試みる
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = supabase }

  // user_id 条件を必ず付けて所有権チェック兼RLS対応
  const { error } = await db.from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[deletePost] error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/home')
  revalidatePath('/profile')
  return { success: true }
}
