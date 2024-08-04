"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import axios from 'axios'

interface Conversation {
    id: string | number
    otherUserId: number
    otherUserName: string
    otherUserProfileIcon: string
    lastMessage: string
    lastMessageTimestamp: string
}

interface Message {
    id: number
    senderId: number
    recipientId: number
    content: string
    timestamp: string
}

const DynamicMessages: React.FC = () => {
    const { user, token } = useAuth()
    const searchParams = useSearchParams()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (user && token) {
            fetchConversations()
        }
    }, [user, token])

    useEffect(() => {
        const conversationId = searchParams.get('conversation')
        const otherUserId = searchParams.get('otherUserId')

        if (conversationId && otherUserId) {
            handleConversationSelect(conversationId, parseInt(otherUserId))
        }
    }, [searchParams, conversations])

    const fetchConversations = async () => {
        try {
            const response = await axios.get<Conversation[]>(
                `http://localhost:8080/api/messages/conversations?userId=${user?.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            setConversations(response.data)
        } catch (error) {
            console.error('Error fetching conversations:', error)
        }
    }

    const fetchMessages = async (conversationId: string | number, newPage = 0) => {
        try {
            const response = await axios.get<Message[]>(
                `http://localhost:8080/api/messages/${conversationId}?page=${newPage}&size=20`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            if (newPage === 0) {
                setMessages(response.data)
            } else {
                setMessages(prevMessages => [...response.data, ...prevMessages])
            }
            setHasMore(response.data.length === 20)
            setPage(newPage)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    const handleConversationSelect = (conversationId: string | number, otherUserId: number) => {
        const conversation = conversations.find(conv => conv.id.toString() === conversationId.toString())
        if (conversation) {
            setSelectedConversation(conversation)
            setPage(0)
            setHasMore(true)
            fetchMessages(conversationId)
        } else {
            startNewConversation(otherUserId)
        }
    }

    const startNewConversation = async (otherUserId: number) => {
        try {
            const response = await axios.post<Conversation>(
                'http://localhost:8080/api/messages/start-conversation',
                { otherUserId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            const newConversation = response.data
            setConversations(prevConversations => [...prevConversations, newConversation])
            setSelectedConversation(newConversation)
            setPage(0)
            setHasMore(true)
            fetchMessages(newConversation.id)
        } catch (error) {
            console.error('Error starting new conversation:', error)
        }
    }

    const sendMessage = async () => {
        if (!selectedConversation || !newMessage.trim()) return

        try {
            const response = await axios.post<Message>(
                'http://localhost:8080/api/messages',
                {
                    senderId: user?.id,
                    recipientId: selectedConversation.otherUserId,
                    content: newMessage
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            setMessages(prevMessages => [...prevMessages, response.data])
            setNewMessage('')
            updateConversationLastMessage(selectedConversation.id, newMessage)
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const updateConversationLastMessage = (conversationId: string | number, lastMessage: string) => {
        const updatedConversations = conversations.map(conv =>
            conv.id === conversationId
                ? { ...conv, lastMessage, lastMessageTimestamp: new Date().toISOString() }
                : conv
        )
        setConversations(updatedConversations)
    }

    const loadMoreMessages = () => {
        if (selectedConversation && hasMore) {
            fetchMessages(selectedConversation.id, page + 1)
        }
    }

    if (!user) {
        return <div>No user logged in</div>
    }

    const getInitials = (name: string) => {
        const names = name.split(' ')
        return (names[0].charAt(0) + (names[1] ? names[1].charAt(0) : '')).toUpperCase()
    }

    return (
        <main className='flex-1 container mx-auto p-4 flex'>
            <div className='w-1/3 bg-white rounded-lg shadow mr-4 overflow-hidden'>
                <h2 className='text-xl font-semibold p-4 bg-orange-500 text-white'>Conversations</h2>
                <div className='overflow-y-auto h-[calc(100vh-200px)]'>
                    {conversations.map(conversation => (
                        <div
                            key={conversation.id}
                            className={`p-4 hover:bg-gray-100 cursor-pointer ${selectedConversation?.id === conversation.id ? 'bg-orange-100' : ''
                                }`}
                            onClick={() => handleConversationSelect(conversation.id, conversation.otherUserId)}
                        >
                            <div className="flex items-center">
                                {conversation.otherUserProfileIcon ? (
                                    <img
                                        src={conversation.otherUserProfileIcon}
                                        alt={conversation.otherUserName}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                                        {getInitials(conversation.otherUserName)}
                                    </div>
                                )}
                                <div>
                                    <h3 className='font-semibold'>{conversation.otherUserName}</h3>
                                    <p className='text-sm text-gray-600 truncate'>{conversation.lastMessage}</p>
                                </div>
                            </div>
                            <p className='text-xs text-gray-400 mt-1'>
                                {new Date(conversation.lastMessageTimestamp).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <div className='flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col'>
                {selectedConversation ? (
                    <>
                        <div className='flex items-center p-4 bg-orange-500 text-white'>
                            <img
                                src={selectedConversation.otherUserProfileIcon || '/default-avatar.png'}
                                alt={selectedConversation.otherUserName}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <h2 className='text-xl font-semibold'>
                                {selectedConversation.otherUserName}
                            </h2>
                        </div>
                        <div className='flex-1 overflow-y-auto p-4'>
                            {hasMore && (
                                <button onClick={loadMoreMessages} className="w-full text-center text-blue-500 mb-4">
                                    Load more messages
                                </button>
                            )}
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`mb-2 p-2 rounded max-w-[70%] ${message.senderId === user.id
                                        ? 'bg-blue-500 text-white ml-auto'
                                        : 'bg-gray-200'
                                        }`}
                                >
                                    <p>{message.content}</p>
                                    <p className='text-xs text-gray-500 mt-1'>
                                        {new Date(message.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className='p-4 bg-gray-100'>
                            <div className='flex'>
                                <input
                                    type='text'
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className='flex-grow border rounded-l p-2'
                                    placeholder='Type a message...'
                                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className='bg-orange-500 text-white px-4 rounded-r hover:bg-orange-600'
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='flex-1 flex items-center justify-center text-gray-500'>
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </main>
    )
}

export default DynamicMessages