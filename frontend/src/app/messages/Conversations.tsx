"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'

interface Conversation {
    id: number
    otherUser: {
        id: number
        firstName: string
        lastName: string
        profileImageUrl?: string
    }
    lastMessage?: string
    lastMessageTimestamp?: string
}

interface ConversationsProps {
    userId: number
    onSelectConversation: (conversationId: string | number, otherUserId: number) => void
    selectedConversationId: string | number | null
}

const Conversations: React.FC<ConversationsProps> = ({ userId, onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const { token } = useAuth()


    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get<Conversation[]>(
                    `http://localhost:8080/api/messages/conversations?userId=${userId}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                )
                setConversations(response.data)
            } catch (error) {
                console.error('Error fetching conversations:', error)
            }
        }

        if (token) {
            fetchConversations()
        }
    }, [userId, token])

    const getInitials = (firstName: string, lastName: string) => {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
    }


    return (
        <div className="w-1/3 border-r">
            <h2 className="text-xl font-semibold mb-4">Conversations</h2>
            {conversations.map(conversation => (
                <div key={conversation.id} className="...">
                    <div className="flex items-center">
                        {conversation.otherUser.profileImageUrl ? (
                            <img
                                src={conversation.otherUser.profileImageUrl}
                                alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                                {getInitials(conversation.otherUser.firstName, conversation.otherUser.lastName)}
                            </div>
                        )}
                        <div>
                            <h3 className='font-semibold'>{`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}</h3>
                            <p className='text-sm text-gray-600 truncate'>{conversation.lastMessage || 'No messages yet'}</p>
                        </div>
                    </div>
                    {conversation.lastMessageTimestamp && (
                        <p className='text-xs text-gray-400 mt-1'>
                            {new Date(conversation.lastMessageTimestamp).toLocaleString()}
                        </p>
                    )}
                </div>
            ))}

        </div>
    )
}

export default Conversations