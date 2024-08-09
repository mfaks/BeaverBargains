import { ConversationProps } from './ConversationProps'
import { ConversationWithUnread } from './ConversationsWithUnread'

export interface UpdatedConversationsProps extends Omit<ConversationProps, 'conversations'> {
    conversations: ConversationWithUnread[]
    setConversations: React.Dispatch<React.SetStateAction<ConversationWithUnread[]>>
    onConversationRead: () => void
}