import { User } from './User'

export interface Conversation {
    id: number
    user1: User
    user2: User
    lastMessageContent: string
    lastMessageSenderId: number
    lastMessageTimestamp: string
    unreadCount: number
  }