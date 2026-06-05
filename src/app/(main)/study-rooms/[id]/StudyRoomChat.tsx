'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { ChevronLeft, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { sendStudyRoomMessage, deleteStudyRoom } from '@/lib/actions/study-rooms'
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
  created_by: string
}

interface Props {
  room: Room
  initialMessages: Message[]
  currentUserId: string
}

export function StudyRoomChat({ room, initialMessages, currentUserId }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const isCreator = currentUserId === room.created_by

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id])

  function handleSend() {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')

    // 楽観的UI
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      room_id: room.id,
      user_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      users: null,
    }
    setMessages(prev => [...prev, optimistic])

    startTransition(async () => {
      const result = await sendStudyRoomMessage(room.id, content)
      if (result?.error) {
        toast.error(result.error)
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      }
    })
  }

  function handleDelete() {
    if (!confirm('この部屋を削除しますか？メッセージもすべて削除されます。')) return
    startDeleteTransition(async () => {
      const result = await deleteStudyRoom(room.id)
      if (result?.error) { toast.error(result.error); return }
      toast.success('部屋を削除しました')
      router.push('/study-rooms')
    })
  }

  // 日付区切りを挿入するためのメッセージグループ
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
    const last = acc[acc.length - 1]
    if (last && last.date === date) {
      last.msgs.push(msg)
    } else {
      acc.push({ date, msgs: [msg] })
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      {/* ヘッダー */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/study-rooms" className="text-muted-foreground hover:text-foreground shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{room.course_name}</p>
              {room.description && (
                <p className="text-xs text-muted-foreground truncate">{room.description}</p>
              )}
            </div>
          </div>
          {isCreator && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="部屋を削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            まだメッセージがありません。最初のメッセージを送りましょう！
          </p>
        )}

        {groupedMessages.map(group => (
          <div key={group.date}>
            {/* 日付区切り */}
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground px-2">{group.date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {group.msgs.map(msg => {
              const isMe = msg.user_id === currentUserId
              return (
                <div key={msg.id} className={`flex gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                      {msg.users?.avatar_url && <AvatarImage src={msg.users.avatar_url} />}
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {msg.users?.nickname?.[0]?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">{msg.users?.nickname}</p>
                    )}
                    <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    } ${msg.id.startsWith('optimistic-') ? 'opacity-60' : ''}`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 mx-1">
                      {timeAgo(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
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
