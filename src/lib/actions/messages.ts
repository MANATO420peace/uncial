'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
  if (!user) return { conversations: [] }

  const { data } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at,
      user1:users!user1_id(id, nickname),
      user2:users!user2_id(id, nickname)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  return { conversations: data ?? [], currentUserId: user.id }
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

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  return { messages: messages ?? [], conversation, currentUserId: user.id }
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }
  if (!content.trim()) return { error: 'メッセージを入力してください' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath(`/messages/${conversationId}`)
  return { error: null }
}
