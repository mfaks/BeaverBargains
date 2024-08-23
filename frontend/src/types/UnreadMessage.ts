interface UnreadMessage {
  id: number;
  content: string;
  conversation: {
    id: number;
  };
  isRead: boolean;
  timestamp: string;
}
