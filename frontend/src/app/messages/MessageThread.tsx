"use client"

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'
import { User } from '@/types/User';

interface Conversation {
    id: number;
    user1: User;
    user2: User;
    lastMessageTimestamp: string;
    lastMessageContent: string;
    lastMessageSenderId: number;
    lastMessageSenderFirstName: string;
}

interface Message {
    id: number;
    content: string;
    sender: User;
    receiver: User;
    timestamp: string;
    conversation: Conversation;
}

interface MessageThreadProps {
    userId: number;
    conversationId: string | number | null;
    otherUserId: number;
    updateLastMessage: (conversationId: number, content: string, senderId: number, timestamp: string, senderFirstName: string) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({ userId, conversationId: initialConversationId, otherUserId, updateLastMessage }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [conversationId, setConversationId] = useState<string | number | null>(initialConversationId)
    const { token } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (token && (conversationId || otherUserId)) {
            fetchMessages(0)
        }
    }, [conversationId, otherUserId, token])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchMessages = async (newPage: number) => {
        setLoading(true);
        setError(null);
        try {
            let currentConversationId = conversationId;
            if (!currentConversationId) {
                const response = await axios.post<Conversation>(
                    'http://localhost:8080/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                currentConversationId = response.data.id;
                setConversationId(currentConversationId);
            }
    
            const response = await axios.get<Message[]>(
                `http://localhost:8080/api/messages/conversations/${currentConversationId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            console.log('Raw message data:', response.data);
            
            const processedMessages = response.data.map((message, index) => {
                console.log(`Processing message ${index}:`, message);
                console.log(message.sender)
                console.log(message.receiver)
                console.log(otherUserId)
                if (!message.sender || !message.receiver) {
                    console.error(`Message ${index} has null sender or receiver:`, message);
                }
                return {
                    ...message,
                    senderId: message.sender?.id ?? null,
                    recipientId: otherUserId ?? null
                };
            }).filter(message => {
                if (message.senderId === null || message.recipientId === null) {
                    console.error('Filtered out message due to null sender or receiver:', message);
                    return false;
                }
                return true;
            });
            
            console.log('Processed messages:', processedMessages);
            
            setMessages(processedMessages);
            setHasMore(false);
            setPage(0);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
    
        try {
            let currentConversationId = conversationId;
            if (!currentConversationId) {
                const conversationResponse = await axios.post<Conversation>(
                    'http://localhost:8080/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                currentConversationId = conversationResponse.data.id;
                setConversationId(currentConversationId);
            }
    
            const response = await axios.post<Message>(
                `http://localhost:8080/api/messages/conversations/${currentConversationId}/messages`,
                { content: newMessage },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
    
            setMessages(prevMessages => [...prevMessages, response.data]);
            setNewMessage('');
            
            updateLastMessage(
                response.data.conversation.id, 
                response.data.content, 
                response.data.sender.id, 
                response.data.timestamp,
                response.data.sender.firstName
            );
        } catch (error) {
            console.error('Error sending message:', error);
            alert('An error occurred while trying to send the message. Please try again.');
        }
    };

    const loadMoreMessages = () => {
        if (hasMore && !loading) {
            fetchMessages(page + 1)
        }
    }

    if (loading && messages.length === 0) {
        return <div className="w-2/3 p-4">Loading messages...</div>
    }

    if (error && messages.length === 0) {
        return <div className="w-2/3 p-4 text-red-500">{error}</div>
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    return (
        <div className="w-2/3 p-4 flex flex-col h-full">
            <div className="flex-grow overflow-y-auto mb-4">
                {hasMore && (
                    <button
                        onClick={loadMoreMessages}
                        className="w-full text-center text-blue-500 mb-4"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load more messages'}
                    </button>
                )}
                {messages.map(message => {
                    const isCurrentUser = message.sender.id === userId;
                    return (
                        <div
                            key={message.id}
                            className={`mb-2 p-2 rounded-lg max-w-[70%] ${isCurrentUser
                                    ? 'bg-blue-500 text-white ml-auto'
                                    : 'bg-gray-200 text-black mr-auto'
                                }`}
                        >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                                }`}>
                                {formatTimestamp(message.timestamp)}
                            </p>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    className="flex-grow border rounded-l p-2"
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-orange-500 text-white px-4 rounded-r hover:bg-orange-600"
                >
                    Send
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}

export default MessageThread