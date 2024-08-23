'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/auth/AuthContext'
import { Conversation } from '@/types/Conversation'
import { User } from '@/types/User'
import { ConversationWithUnread } from '@/types/ConversationsWithUnread'
import { UpdatedConversationsProps } from '@/types/UpdatedConversationProps'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

const Conversations: React.FC<UpdatedConversationsProps> = ({ userId, conversations, setConversations, onSelectConversation, selectedConversationId, onConversationRead }) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isAuthenticated, user, token } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        } else if (isAuthenticated && user) {
            fetchConversationsAndUnreadMessages()
        }
    }, [isAuthenticated, loading, user, router])

    const fetchConversationsAndUnreadMessages = async () => {
        setLoading(true)
        setError(null)
        try {
            const [conversationsResponse, unreadMessagesResponse] = await Promise.all([
                axios.get<Conversation[]>(`https://beaverbargains.onrender.com/api/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get<UnreadMessage[]>(`https://beaverbargains.onrender.com/api/messages/unread`, {
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
                `https://beaverbargains.onrender.com/api/messages/conversations/${conversationId}/read`,
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

    const getOtherUser = (conversation: Conversation): User => {
        return conversation.user1.id === userId ? conversation.user2 : conversation.user1
    }

    const BASE_URL = 'https://beaverbargains.onrender.com'
    const getFullImageUrl = (imageUrl: string | undefined): string => {
        if (!imageUrl) {
            return ''
        }
        if (imageUrl.startsWith('http')) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    return (
        <div>
            {isAuthenticated ? (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="space-y-4 p-4">
                                {[...Array(5)].map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        ) : (
                            conversations.map((conversation: ConversationWithUnread) => {
                                const otherUser = getOtherUser(conversation)
                                return (
                                    <div
                                        key={conversation.id}
                                        className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b border-orange-200 ${selectedConversationId === conversation.id ? 'bg-orange-200' : ''} hover:bg-orange-100`}
                                        onClick={() => handleConversationClick(conversation.id, otherUser.id)}
                                    >
                                        <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 border">
                                            <img
                                                className="aspect-square h-full w-full"
                                                alt={`${otherUser.firstName} ${otherUser.lastName}`}
                                                src={getFullImageUrl(otherUser.profileImageUrl) || "/placeholder-user.jpg"}
                                            />
                                        </span>
                                        <div className="flex-1 min-w-0 flex items-center">
                                            <span className="text-sm font-medium truncate">{`${otherUser.firstName} ${otherUser.lastName}`}</span>
                                            {conversation.unreadCount > 0 && (
                                                <div className="ml-2 flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}
export default Conversations