'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/messages'
import { uploadImages } from '@/lib/uploadImages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Send, ImageIcon, X } from 'lucide-react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  image_url?: string | null
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if ((!input.trim() && !imageFile) || isPending) return
    const content = input
    setInput('')

    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      image_url: imagePreview,
      created_at: new Date().toISOString(),
      read_at: null,
      users: null,
    }
    setMessages(prev => [...prev, optimisticMsg])
    clearImage()

    startTransition(async () => {
      let imageUrl: string | undefined
      if (imageFile) {
        const urls = await uploadImages([imageFile])
        imageUrl = urls[0]
      }
      await sendMessage(conversationId, content, imageUrl)
    })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
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
                {msg.image_url && (
                  <img
                    src={msg.image_url}
                    alt=""
                    className="rounded-xl max-w-[200px] max-h-[200px] object-cover"
                  />
                )}
                {msg.content && (
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
                )}
                <span className="text-[10px] text-muted-foreground">
                  {isMe && msg.read_at ? '既読 · ' : ''}{timeAgo(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-background">
        {imagePreview && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="relative">
              <img src={imagePreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={clearImage}
                className="absolute -top-1 -right-1 bg-foreground text-background rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSend} className="px-4 py-3 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={(!input.trim() && !imageFile) || isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
