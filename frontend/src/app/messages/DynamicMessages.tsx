"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import Conversations from './Conversations'
import MessageThread from './MessageThread'
import { Conversation } from '@/types/Conversation'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'

const DynamicMessages: React.FC = () => {
    const { isAuthenticated, user } = useAuth()
    const searchParams = useSearchParams()
    const [selectedConversation, setSelectedConversation] = useState<{ id: string | number | null, otherUserId: number } | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()

    if (!isAuthenticated || !user) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
    }

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to access messages. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            const conversationId = searchParams.get('conversation')
            const otherUserId = searchParams.get('otherUserId')
            if (otherUserId) {
                setSelectedConversation({ id: conversationId, otherUserId: parseInt(otherUserId) })
            }
        }
    }, [isAuthenticated, router, searchParams])

    const handleConversationSelect = (conversationId: string | number | null, otherUserId: number) => {
        setSelectedConversation({ id: conversationId, otherUserId })
        window.history.pushState({}, '', `/messages?conversation=${conversationId || ''}&otherUserId=${otherUserId}`)
    }

    const updateLastMessage = (conversationId: number, content: string, senderId: number, timestamp: string, senderFirstName: string) => {
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