export interface UnreadMessagesContextType {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  clearUnreadCount: () => void;
}
