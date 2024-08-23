'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/auth/AuthContext'
import { Conversation } from '@/types/Conversation'
import { Message } from '@/types/Message'
import { MessageThreadProps } from '@/types/MessageThreadProps'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

const MessageThread: React.FC<MessageThreadProps> = ({ userId, conversationId: initialConversationId, otherUserId, updateLastMessage }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [conversationId, setConversationId] = useState<string | number | null>(initialConversationId)
    const { token, isAuthenticated } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [receiverInfo, setReceiverInfo] = useState<{ name: string, profileImageUrl: string } | null>(null)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        } else {
            fetchMessages(0)
            fetchReceiverInfo()
        }
    }, [conversationId, otherUserId, token, isAuthenticated])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchReceiverInfo = async () => {
        if (!otherUserId) return
        try {
            const response = await axios.get(`https://beaverbargains.onrender.com/api/users/${otherUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setReceiverInfo({
                name: `${response.data.firstName} ${response.data.lastName}`,
                profileImageUrl: response.data.profileImageUrl
            })
        } catch (error) {
            console.error('Error fetching receiver info:', error)
        }
    }

    const fetchMessages = async (newPage: number) => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to fetch messages. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
            return
        }

        setLoading(true)
        setError(null)
        try {
            let currentConversationId = conversationId
            if (!currentConversationId) {
                const response = await axios.post<Conversation>(
                    'https://beaverbargains.onrender.com/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                currentConversationId = response.data.id
                setConversationId(currentConversationId)
            }

            const response = await axios.get<Message[]>(
                `https://beaverbargains.onrender.com/api/messages/conversations/${currentConversationId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )

            const processedMessages = response.data.map((message) => ({
                ...message,
                senderId: message.sender?.id ?? null,
                recipientId: otherUserId ?? null
            })).filter(message => message.senderId !== null && message.recipientId !== null)

            setMessages(processedMessages)
            setHasMore(false)
            setPage(0)
        } catch (error) {
            console.error('Error fetching messages:', error)
            setError('Failed to load messages. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to send messages. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
            return
        }

        if (!newMessage.trim()) return

        try {
            let currentConversationId = conversationId
            if (!currentConversationId) {
                const conversationResponse = await axios.post<Conversation>(
                    'https://beaverbargains.onrender.com/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                currentConversationId = conversationResponse.data.id
                setConversationId(currentConversationId)
            }

            const response = await axios.post<Message>(
                `https://beaverbargains.onrender.com/api/messages/conversations/${currentConversationId}/messages`,
                { content: newMessage },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            setMessages(prevMessages => [...prevMessages, response.data])
            setNewMessage('')

            updateLastMessage(
                response.data.conversation.id,
                response.data.content,
                response.data.sender.id,
                response.data.timestamp,
                response.data.sender.firstName
            )
        } catch (error) {
            console.error('Error sending message:', error)
            alert('An error occurred while trying to send the message. Please try again.')
        }
    }

    const loadMoreMessages = () => {
        if (hasMore && !loading) {
            fetchMessages(page + 1)
        }
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        })
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
                    {receiverInfo && (
                        <div className="sticky top-0 z-10 bg-orange-100 px-4 h-[72px] flex items-center">
                            <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 border border-orange-300 mr-3">
                                <img
                                    className="aspect-square h-full w-full"
                                    alt={receiverInfo.name}
                                    src={getFullImageUrl(receiverInfo.profileImageUrl)}
                                />
                            </span>
                            <h2 className="text-lg font-semibold text-orange-700">{receiverInfo.name}</h2>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-scroll p-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                        {loading && messages.length === 0 ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        ) : (
                            <div>
                                {hasMore && (
                                    <button
                                        onClick={loadMoreMessages}
                                        className="w-full text-center text-primary mb-4"
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Load more messages'}
                                    </button>
                                )}
                                <div className="grid gap-4">
                                    {messages.map(message => {
                                        const isCurrentUser = message.sender.id === userId
                                        return (
                                            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                {!isCurrentUser && (
                                                    <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8 border border-orange-300 mr-2">
                                                        <img className="aspect-square h-full w-full" alt="Recipient" src={getFullImageUrl(receiverInfo?.profileImageUrl)} />
                                                    </span>
                                                )}
                                                <div className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                                                    <p>{message.content}</p>
                                                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-orange-100' : 'text-orange-500'}`}>
                                                        {formatTimestamp(message.timestamp)}
                                                    </p>
                                                </div>
                                                {isCurrentUser && (
                                                    <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8 border border-orange-300 ml-2">
                                                        <img className="aspect-square h-full w-full" alt="You" src={getFullImageUrl(message.sender.profileImageUrl)} />
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pb-3 px-4">
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                className="flex w-full border border-orange-300 bg-white text-sm ring-offset-background placeholder:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px] rounded-2xl resize-none p-4 pr-16"
                                placeholder="Type your message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600 absolute w-10 h-10 top-1/2 -translate-y-1/2 right-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M22 2L11 13" />
                                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-destructive mt-2">{error}</p>}
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default MessageThread