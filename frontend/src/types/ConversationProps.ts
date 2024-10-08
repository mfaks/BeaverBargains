import { Conversation } from "./Conversation";

export interface ConversationProps {
  userId: number;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  onSelectConversation: (
    conversationId: string | number,
    otherUserId: number,
  ) => void;
  selectedConversationId: string | number | null;
}
