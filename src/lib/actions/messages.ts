'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushToUser } from './push'

export async function getOrCreateConversation(otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です', conversation: null }

  const uid = user.id
  const [u1, u2] = uid < otherUserId ? [uid, otherUserId] : [otherUserId, uid]

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .maybeSingle()

  if (existing) return { conversation: existing, error: null }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user1_id: u1, user2_id: u2 })
    .select('id')
    .single()

  if (error) return { error: error.message, conversation: null }
  return { conversation: data, error: null }
}

export async function startConversation(otherUserId: string) {
  const result = await getOrCreateConversation(otherUserId)
  if (result.error || !result.conversation) return { error: result.error }
  redirect(`/messages/${result.conversation.id}`)
}

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { conversations: [], currentUserId: null }

  const { data } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at,
      user1:users!user1_id(id, nickname),
      user2:users!user2_id(id, nickname)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  if (!data || data.length === 0) return { conversations: [], currentUserId: user.id }

  // 各会話の未読件数を一括取得
  const convIds = data.map(c => c.id)
  const { data: unreadMsgs } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', convIds)
    .neq('sender_id', user.id)
    .is('read_at', null)

  const unreadMap = new Map<string, number>()
  unreadMsgs?.forEach(m => {
    unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1)
  })

  return {
    conversations: data.map(c => ({ ...c, unread_count: unreadMap.get(c.id) ?? 0 })),
    currentUserId: user.id,
  }
}

export async function getUnreadMessageCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: convs } = await supabase
    .from('conversations')
    .select('id')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

  if (!convs?.length) return 0

  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', convs.map(c => c.id))
    .neq('sender_id', user.id)
    .is('read_at', null)

  return count ?? 0
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { messages: [], conversation: null, currentUserId: null }

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id,
      user1:users!user1_id(id, nickname),
      user2:users!user2_id(id, nickname)
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation) return { messages: [], conversation: null, currentUserId: null }

  const { data: messages } = await supabase
    .from('messages')
    .select('*, users(id, nickname)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // adminクライアントでRLSを回避して既読処理（RLSにUPDATEポリシーがない場合でも確実に実行）
  let db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
  try { db = createAdminClient() } catch { db = supabase }

  await db
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  return { messages: messages ?? [], conversation, currentUserId: user.id }
}

export async function sendMessage(conversationId: string, content: string, imageUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (!content.trim() && !imageUrl) return { error: 'メッセージを入力してください' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
    ...(imageUrl ? { image_url: imageUrl } : {}),
  })

  if (error) return { error: error.message }

  // 相手ユーザーへプッシュ通知を送信
  const { data: conv } = await supabase
    .from('conversations')
    .select('user1_id, user2_id')
    .eq('id', conversationId)
    .single()
  if (conv) {
    const recipientId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
    const { data: sender } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single()
    const senderName = sender?.nickname ?? 'ユーザー'
    await sendPushToUser(
      recipientId,
      `${senderName}さんからメッセージ`,
      content.trim() || '画像が届きました',
      `/messages/${conversationId}`,
    )
  }

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath('/messages')
  return { error: null }
}
