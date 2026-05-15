'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/messages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
  users: { id: string; nickname: string } | null
}

interface Props {
  conversationId: string
  currentUserId: string
  otherUser: { id: string; nickname: string }
}

export function ChatRoom({ conversationId, currentUserId, otherUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loaded, setLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 初期メッセージをクライアント側でフェッチ
  useEffect(() => {
    supabase
      .from('messages')
      .select('*, users(id, nickname)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? [])
        setLoaded(true)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  // Realtimeサブスクリプション
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            // 楽観的メッセージ（optimistic-）との重複を除去して追加
            const withoutOptimistic = prev.filter(
              m => !m.id.startsWith('optimistic-') || m.sender_id !== newMsg.sender_id
            )
            if (withoutOptimistic.some(m => m.id === newMsg.id)) return prev
            return [...withoutOptimistic, {
              ...newMsg,
              users: newMsg.sender_id === currentUserId
                ? null
                : { id: otherUser.id, nickname: otherUser.nickname },
            }]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId, otherUser.id])

  useEffect(() => {
    if (loaded) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loaded])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isPending) return
    const content = input
    setInput('')

    // 楽観的更新
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      users: null,
    }
    setMessages(prev => [...prev, optimisticMsg])

    startTransition(async () => {
      await sendMessage(conversationId, content)
    })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {!loaded && (
          <p className="text-center text-sm text-muted-foreground py-8">読み込み中...</p>
        )}
        {loaded && messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            まだメッセージがありません
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
              {!isMe && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {otherUser.nickname[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-[75%] flex flex-col gap-1', isMe && 'items-end')}>
                <div
                  className={cn(
                    'px-3 py-2 rounded-2xl text-sm leading-relaxed',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  )}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {isMe && msg.read_at ? '既読 · ' : ''}{timeAgo(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t px-4 py-3 flex gap-2 bg-background">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
