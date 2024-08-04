"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'

interface Message {
    id: number
    senderId: number
    recipientId: number
    content: string
    timestamp: string
}

interface MessageThreadProps {
    userId: number
    conversationId: string | number
    otherUserId: number
}

const MessageThread: React.FC<MessageThreadProps> = ({ userId, conversationId, otherUserId }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const { token } = useAuth()

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get<Message[]>(
                    `http://localhost:8080/api/messages/${conversationId}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                setMessages(response.data)
            } catch (error) {
                console.error('Error fetching messages:', error)
            }
        }

        if (token && conversationId) {
            fetchMessages()
        }
    }, [conversationId, token])

    const sendMessage = async () => {
        try {
            const response = await axios.post<Message>(
                'http://localhost:8080/api/messages',
                {
                    senderId: userId,
                    recipientId: otherUserId,
                    content: newMessage
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )
            setMessages([...messages, response.data])
            setNewMessage('')
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    return (
        <div className="w-2/3 p-4">
            <div className="h-[400px] overflow-y-auto mb-4">
                {messages.map(message => (
                    <div 
                        key={message.id} 
                        className={`mb-2 p-2 rounded ${
                            message.senderId === userId ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                        }`}
                    >
                        {message.content}
                    </div>
                ))}
            </div>
            <div className="flex">
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-grow border rounded-l p-2"
                    placeholder="Type a message..."
                />
                <button 
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 rounded-r"
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default MessageThread