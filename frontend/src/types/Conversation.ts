import { User } from './User'

export interface Conversation {
    id: number
    user1: User
    user2: User
    lastMessageTimestamp: string
    lastMessageContent: string
    lastMessageSenderId: number
    lastMessageSenderFirstName: string
}
