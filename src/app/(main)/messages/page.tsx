import { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { getConversations } from '@/lib/actions/messages'
import { ConversationList } from './ConversationList'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'メッセージ' }

export default async function MessagesPage() {
  const { conversations, currentUserId } = await getConversations()

  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-lg">メッセージ</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <MessageCircle className="h-12 w-12 opacity-30" />
          <p className="text-sm">まだメッセージがありません</p>
          <p className="text-xs">ユーザープロフィールからDMを送ることができます</p>
        </div>
      ) : (
        <ConversationList
          conversations={conversations as never}
          currentUserId={currentUserId ?? ''}
        />
      )}
    </div>
  )
}
