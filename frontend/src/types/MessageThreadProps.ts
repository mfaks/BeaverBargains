export interface MessageThreadProps {
    userId: number
    conversationId: string | number | null
    otherUserId: number
    updateLastMessage: (conversationId: number, content: string, senderId: number, timestamp: string, senderFirstName: string) => void
}