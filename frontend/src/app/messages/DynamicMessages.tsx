"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import { useUnreadMessages } from "./UnreadMessagesContext";
import Conversations from "./Conversations";
import MessageThread from "./MessageThread";
import { Conversation } from "@/types/Conversation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EmptyStateCard from "@/components/ui/EmptyStateCard";
import { FaComments, FaShoppingCart } from "react-icons/fa";

const DynamicMessages: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { fetchUnreadCount } = useUnreadMessages();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string | number | null;
    otherUserId: number;
  } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        const conversationId = searchParams.get("conversation");
        const otherUserId = searchParams.get("otherUserId");
        if (otherUserId) {
          setSelectedConversation({
            id: conversationId,
            otherUserId: parseInt(otherUserId),
          });
        }
      }
    }
  }, [isAuthenticated, user, loading, router, searchParams]);

  const handleConversationSelect = (
    conversationId: string | number | null,
    otherUserId: number,
  ) => {
    setSelectedConversation({ id: conversationId, otherUserId });
    window.history.pushState(
      {},
      "",
      `/messages?conversation=${conversationId || ""}&otherUserId=${otherUserId}`,
    );
  };

  const updateLastMessage = (
    conversationId: number,
    content: string,
    senderId: number,
    timestamp: string,
    senderFirstName: string,
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessageContent: content,
              lastMessageSenderId: senderId,
              lastMessageTimestamp: timestamp,
              lastMessageSenderFirstName: senderFirstName,
              unreadCount: conv.unreadCount,
            }
          : conv,
      ),
    );
  };

  const handleConversationRead = () => {
    fetchUnreadCount();
  };

  const handleNavigateToMarketplace = () => {
    router.push("/marketplace");
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div className="flex flex-col h-screen bg-orange-50 text-orange-500">
          <div className="flex-1 overflow-hidden">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={15} minSize={15}>
                <div className="h-full overflow-y-auto bg-orange-100">
                  <Conversations
                    userId={user.id}
                    conversations={conversations}
                    setConversations={setConversations}
                    onSelectConversation={handleConversationSelect}
                    selectedConversationId={selectedConversation?.id ?? null}
                    onConversationRead={handleConversationRead}
                  />
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-orange-300 hover:bg-orange-400 transition-colors" />
              <Panel>
                {selectedConversation ? (
                  <MessageThread
                    userId={user.id}
                    conversationId={selectedConversation.id}
                    otherUserId={selectedConversation.otherUserId}
                    updateLastMessage={updateLastMessage}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-orange-50">
                    {conversations.length === 0 ? (
                      <EmptyStateCard
                        title="No Conversations Yet"
                        description="Start chatting with sellers by browsing items in the marketplace"
                        actionText="Go to Marketplace"
                        onAction={handleNavigateToMarketplace}
                        icon={
                          <FaShoppingCart className="text-orange-500 text-5xl" />
                        }
                      />
                    ) : (
                      <EmptyStateCard
                        title="No Conversation Selected"
                        description="Choose a conversation from the list to start messaging"
                        actionText="Select a Conversation"
                        onAction={() => {}}
                        icon={
                          <FaComments className="text-orange-500 text-5xl" />
                        }
                      />
                    )}
                  </div>
                )}
              </Panel>
            </PanelGroup>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default DynamicMessages;
