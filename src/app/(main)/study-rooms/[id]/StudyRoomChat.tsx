'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { ChevronLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { sendStudyRoomMessage } from '@/lib/actions/study-rooms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'

interface Message {
  id: string
  room_id: string
  user_id: string
  content: string
  created_at: string
  users: { id: string; nickname: string; avatar_url?: string | null } | null
}

interface Room {
  id: string
  course_name: string
  description?: string | null
}

interface Props {
  room: Room
  initialMessages: Message[]
  currentUserId: string
}

export function StudyRoomChat({ room, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`study-room-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'study_room_messages',
        filter: `room_id=eq.${room.id}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('study_room_messages')
          .select('*, users(id, nickname, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [room.id, supabase])

  function handleSend() {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')
    startTransition(async () => {
      const result = await sendStudyRoomMessage(room.id, content)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center gap-2">
          <Link href="/study-rooms" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{room.course_name}</p>
            {room.description && <p className="text-xs text-muted-foreground truncate">{room.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">まだメッセージがありません。最初のメッセージを送りましょう！</p>
        )}
        {messages.map(msg => {
          const isMe = msg.user_id === currentUserId
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <Avatar className="h-7 w-7 flex-shrink-0">
                  {msg.users?.avatar_url && <AvatarImage src={msg.users.avatar_url} />}
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {msg.users?.nickname?.[0]?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && <p className="text-[10px] text-muted-foreground mb-0.5">{msg.users?.nickname}</p>}
                <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                  {msg.content}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t px-3 py-2 bg-background flex gap-2 items-center">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="メッセージを入力..."
          className="flex-1 text-sm"
        />
        <Button size="icon" onClick={handleSend} disabled={isPending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
