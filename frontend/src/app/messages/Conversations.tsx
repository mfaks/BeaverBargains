"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Conversation } from '@/types/Conversation'
import { User } from '@/types/User'
import { ConversationsProps } from '@/types/ConversatoinProps'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'

const Conversations: React.FC<ConversationsProps> = ({ userId, conversations, setConversations, onSelectConversation, selectedConversationId }) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isAuthenticated, token } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage("You must be logged in to access messages. Redirecting to login.")
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else if (token) {
            fetchConversations()
        }
    }, [isAuthenticated, token, router])

    const fetchConversations = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get<Conversation[]>(
                `http://localhost:8080/api/messages`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )
            setConversations(response.data)
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching conversations:', error)
            setError('Failed to load conversations. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const findOrCreateConversation = async (otherUserId: number) => {
        const existingConversation = conversations.find(
            conv => (conv.user1.id === otherUserId || conv.user2.id === otherUserId)
        )    
        if (existingConversation) {
            return existingConversation.id
        } else {
            try {
                const response = await axios.post<Conversation>(
                    'http://localhost:8080/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                setConversations(prevConversations => [...prevConversations, response.data])
                return response.data.id
            } catch (error) {
                console.error('Error creating conversation:', error)
                throw error
            }
        }
    }

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return '??'
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
    }

    const getOtherUser = (conversation: Conversation): User => {
        return conversation.user1.id === userId ? conversation.user2 : conversation.user1
    }

    const getLastMessageSender = (conversation: Conversation): string => {
        if (!conversation.lastMessageSenderId) {
            return 'No messages yet'
        }
        return conversation.lastMessageSenderId === userId ? 'You' : getOtherUser(conversation).firstName
    }

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    if (!isAuthenticated) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
    }

    if (loading) {
        return <div className='w-1/5 border-r p-4'>Loading conversations...</div>
    }

    if (error) {
        return <div className='w-1/5 border-r p-4 text-red-500'>{error}</div>
    }

    return (
        <div className='w-1/5 border-r overflow-y-auto'>
            <h2 className='text-xl font-semibold p-4 text-center border-b'>My Messages</h2>
            {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation)
                const lastMessageSender = getLastMessageSender(conversation)
                
                return (
                    <div
                        key={conversation.id}
                        className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b ${
                            selectedConversationId === conversation.id ? 'bg-orange-100' : ''
                        }`}
                        onClick={async () => {
                            const conversationId = await findOrCreateConversation(otherUser.id)
                            onSelectConversation(conversationId, otherUser.id)
                        }}
                    >
                        <div className='flex items-center'>
                            <Avatar className='w-10 h-10 mr-3'>
                                <AvatarImage
                                    src={otherUser.profileImage}
                                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                                />
                                <AvatarFallback>
                                    {getInitials(otherUser.firstName, otherUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-grow overflow-hidden'>
                                <h3 className='font-semibold'>
                                    {`${otherUser.firstName} ${otherUser.lastName}`}
                                </h3>
                                <p className='text-sm text-gray-600 truncate'>
                                    {conversation.lastMessageTimestamp 
                                        ? `Last message sent by ${lastMessageSender}`
                                        : 'No messages yet'}
                                </p>
                            </div>
                        </div>
                        {conversation.lastMessageTimestamp && (
                            <p className='text-xs text-gray-400 mt-1'>
                                {formatDateTime(conversation.lastMessageTimestamp)}
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default Conversations