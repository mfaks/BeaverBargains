import { Conversation } from "./Conversation";

export interface ConversationWithUnread extends Conversation {
  unreadCount: number;
}
