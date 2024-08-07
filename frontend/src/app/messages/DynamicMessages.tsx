"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import axios from 'axios'
import Conversations from './Conversations'
import MessageThread from './MessageThread'

interface User {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
}

interface Conversation {
    id: number;
    user1: User;
    user2: User;
    lastMessageTimestamp: string;
    lastMessageContent: string;
    lastMessageSenderId: number;
    lastMessageSenderFirstName: string;
}

const DynamicMessages: React.FC = () => {
    const { user, token } = useAuth()
    const searchParams = useSearchParams()
    const [selectedConversation, setSelectedConversation] = useState<{ id: string | number | null, otherUserId: number } | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])

    useEffect(() => {
        const conversationId = searchParams.get('conversation')
        const otherUserId = searchParams.get('otherUserId')

        if (otherUserId) {
            setSelectedConversation({ id: conversationId, otherUserId: parseInt(otherUserId) })
        }
    }, [searchParams])

    const handleConversationSelect = (conversationId: string | number | null, otherUserId: number) => {
        setSelectedConversation({ id: conversationId, otherUserId })
        // Update the URL
        window.history.pushState({}, '', `/messages?conversation=${conversationId || ''}&otherUserId=${otherUserId}`)
    }

    const updateLastMessage = (
        conversationId: number,
        content: string,
        senderId: number,
        timestamp: string,
        senderFirstName: string
    ) => {
        setConversations(prevConversations =>
            prevConversations.map(conv =>
                conv.id === conversationId
                    ? {
                        ...conv,
                        lastMessageContent: content,
                        lastMessageSenderId: senderId,
                        lastMessageTimestamp: timestamp,
                        lastMessageSenderFirstName: senderFirstName
                    }
                    : conv
            )
        )
    }

    if (!user) {
        return <div>No user logged in</div>
    }

    return (
        <main className='flex-1 container mx-auto p-4 flex'>
            <Conversations
                userId={user.id}
                conversations={conversations}
                setConversations={setConversations}
                onSelectConversation={handleConversationSelect}
                selectedConversationId={selectedConversation?.id ?? null}
            />
            {selectedConversation ? (
                <MessageThread
                    userId={user.id}
                    conversationId={selectedConversation.id}
                    otherUserId={selectedConversation.otherUserId}
                    updateLastMessage={updateLastMessage}
                />
            ) : (
                <div className='flex-1 flex items-center justify-center text-gray-500'>
                    Select a conversation to start messaging
                </div>
            )}
        </main>
    )
}

export default DynamicMessages