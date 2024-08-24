"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../components/auth/AuthContext";
import { UnreadMessagesContextType } from "@/types/UnreadMessageContextType";

const UnreadMessagesContext = createContext<
  UnreadMessagesContextType | undefined
>(undefined);

export const UnreadMessagesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, token, loading } = useAuth();

  const fetchUnreadCount = async () => {
    if (isAuthenticated && token) {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/messages/unread/count",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUnreadCount(response.data);
      } catch (error) {
        console.error("Error fetching unread message count:", error);
      }
    }
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        fetchUnreadCount();
      } else {
        clearUnreadCount();
      }
    }
  }, [isAuthenticated, token, loading]);

  return (
    <UnreadMessagesContext.Provider
      value={{ unreadCount, fetchUnreadCount, clearUnreadCount }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadMessages must be used within a UnreadMessagesProvider",
    );
  }
  return context;
};
