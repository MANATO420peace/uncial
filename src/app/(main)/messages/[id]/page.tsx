import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMessages } from '@/lib/actions/messages'
import { ChatRoom } from './ChatRoom'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'チャット' }
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params
  const { messages, conversation, currentUserId } = await getMessages(id)

  if (!conversation || !currentUserId) notFound()

  const user1 = (conversation as { user1: { id: string; nickname: string; avatar_url?: string | null } | null }).user1
  const user2 = (conversation as { user2: { id: string; nickname: string; avatar_url?: string | null } | null }).user2
  const otherUser = user1?.id === currentUserId ? user2 : user1

  if (!otherUser) notFound()

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
      <div className="sticky top-14 z-10 bg-background border-b px-4 h-12 flex items-center gap-3">
        <Link href="/messages" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <Link href={`/user/${otherUser.id}`} className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {otherUser.nickname[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{otherUser.nickname}</span>
        </Link>
      </div>

      <ChatRoom
        conversationId={id}
        currentUserId={currentUserId}
        otherUser={otherUser}
      />
    </div>
  )
}
