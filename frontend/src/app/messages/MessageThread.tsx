'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import { Conversation } from '@/types/Conversation'
import { Message } from '@/types/Message'
import { MessageThreadProps } from '@/types/MessageThreadProps'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'

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

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to view messages. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else if (token && (conversationId || otherUserId)) {
            fetchMessages(0)
        }
    }, [conversationId, otherUserId, token, isAuthenticated])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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
                    'http://localhost:8080/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                currentConversationId = response.data.id
                setConversationId(currentConversationId)
            }

            const response = await axios.get<Message[]>(
                `http://localhost:8080/api/messages/conversations/${currentConversationId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )
            
            const processedMessages = response.data.map((message, index) => {
                return {
                    ...message,
                    senderId: message.sender?.id ?? null,
                    recipientId: otherUserId ?? null
                }
            }).filter(message => {
                if (message.senderId === null || message.recipientId === null) {
                    console.error('Filtered out message due to null sender or receiver:', message)
                    return false
                }
                return true
            })

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
                    'http://localhost:8080/api/messages',
                    { receiverId: otherUserId },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                currentConversationId = conversationResponse.data.id
                setConversationId(currentConversationId)
            }

            const response = await axios.post<Message>(
                `http://localhost:8080/api/messages/conversations/${currentConversationId}/messages`,
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

    if (!isAuthenticated) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
    }

    if (loading && messages.length === 0) {
        return <div className='w-2/3 p-4'>Loading messages...</div>
    }

    if (error && messages.length === 0) {
        return <div className='w-2/3 p-4 text-red-500'>{error}</div>
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

    return (
        <>
            <div className='w-2/3 p-4 flex flex-col h-full'>
                <div className='flex-grow overflow-y-auto mb-4'>
                    {hasMore && (
                        <button
                            onClick={loadMoreMessages}
                            className='w-full text-center text-blue-500 mb-4'
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load more messages'}
                        </button>
                    )}
                    {messages.map(message => {
                        const isCurrentUser = message.sender.id === userId
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
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className='flex'>
                    <input
                        type='text'
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        className='flex-grow border rounded-l p-2'
                        placeholder='Type a message...'
                    />
                    <button
                        onClick={sendMessage}
                        className='bg-orange-500 text-white px-4 rounded-r hover:bg-orange-600'
                    >
                        Send
                    </button>
                </div>
                {error && <p className='text-red-500 mt-2'>{error}</p>}
            </div>
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        </>
    )
}

export default MessageThread