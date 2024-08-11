'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Conversation } from '@/types/Conversation'
import { User } from '@/types/User'
import { ConversationWithUnread } from '@/types/ConversationsWithUnread'
import { UpdatedConversationsProps } from '@/types/UpdatedConversationProps'

const Conversations: React.FC<UpdatedConversationsProps> = ({ userId, conversations, setConversations, onSelectConversation, selectedConversationId, onConversationRead }) => {

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isAuthenticated, token } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to access messages. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else if (token) {
            fetchConversationsAndUnreadMessages()
        }
    }, [isAuthenticated, token, router])

    const fetchConversationsAndUnreadMessages = async () => {
        setLoading(true)
        setError(null)
        try {
            const [conversationsResponse, unreadMessagesResponse] = await Promise.all([
                axios.get<Conversation[]>(`http://localhost:8080/api/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get<UnreadMessage[]>(`http://localhost:8080/api/messages/unread`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            const unreadMessagesByConversation = unreadMessagesResponse.data.reduce((acc, message) => {
                acc[message.conversation.id] = (acc[message.conversation.id] || 0) + 1
                return acc
            }, {} as Record<number, number>)

            const conversationsWithUnread = conversationsResponse.data.map(conversation => ({
                ...conversation,
                unreadCount: unreadMessagesByConversation[conversation.id] || 0
            }))

            setConversations(conversationsWithUnread)
        } catch (error) {
            console.error('Error fetching conversations and unread messages:', error)
            setError('Failed to load conversations. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const markConversationAsRead = async (conversationId: number) => {
        try {
            await axios.post(
                `http://localhost:8080/api/messages/conversations/${conversationId}/read`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            setConversations(prevConversations =>
                prevConversations.map(conv =>
                    conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                )
            )
            onConversationRead()
        } catch (error) {
            console.error('Error marking conversation as read:', error)
        }
    }

    const handleConversationClick = async (conversationId: number, otherUserId: number) => {
        await markConversationAsRead(conversationId)
        onSelectConversation(conversationId, otherUserId)
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
        return <div className='w-1/5 border-r p-4'>Loading conversations.. .</div>
    }

    if (error) {
        return <div className='w-1/5 border-r p-4 text-red-500'>{error}</div>
    }

    const BASE_URL = 'http://localhost:8080'
    const getFullImageUrl = (imageUrl: string | undefined): string => {
        if (!imageUrl){
            return ''
        }
        if (imageUrl.startsWith('http')) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    return (
        <div className='w-1/5 border-r overflow-y-auto'>
            <h2 className='text-xl font-semibold p-4 text-center border-b'>My Messages</h2>
            {conversations.map((conversation: ConversationWithUnread) => {
                const otherUser = getOtherUser(conversation)
                const lastMessageSender = getLastMessageSender(conversation)

                return (
                    <div
                        key={conversation.id}
                        className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b ${selectedConversationId === conversation.id ? 'bg-orange-100' : ''
                            } ${conversation.unreadCount > 0 ? 'bg-orange-50' : ''
                            }`}
                        onClick={() => handleConversationClick(conversation.id, otherUser.id)}
                    >
                        <div className='flex items-center'>
                            {conversation.unreadCount > 0 && (
                                <div className='w-2 h-2 bg-orange-600 rounded-full mr-2'></div>
                            )}
                            <Avatar className='w-10 h-10 mr-3'>
                                <AvatarImage
                                    src={getFullImageUrl(otherUser.profileImageUrl)}
                                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                                />
                                <AvatarFallback>
                                    {getInitials(otherUser.firstName, otherUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-grow overflow-hidden'>
                                <h3 className={`font-semibold ${conversation.unreadCount > 0 ? 'text-orange-600' : ''
                                    }`}>
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