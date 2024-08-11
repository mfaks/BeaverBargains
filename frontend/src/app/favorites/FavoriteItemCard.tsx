"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteItemCardProps } from '@/types/FavoriteItemCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({ item, onToggleFavorite, getFullImageUrl }) => {
    const router = useRouter()
    const { user, token } = useAuth()
    const [isFavorited, setIsFavorited] = useState(item.isFavorited)
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    const [isFullDetailsOpen, setIsFullDetailsOpen] = useState(false)
    const [messageContent, setMessageContent] = useState(`Hi ${item.seller.firstName}, my name is ${user?.firstName} and I'm interested in your item: ${item.title}`)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [fullImageUrls, setFullImageUrls] = useState<string[]>([])

    useEffect(() => {
        setIsFavorited(item.isFavorited)
    }, [item.isFavorited])

    useEffect(() => {
        setCurrentImageIndex(0)
        setFullImageUrls(item.imageUrls.map(getFullImageUrl))
    }, [item.imageUrls, getFullImageUrl])

    const handleFavoriteToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsFavorited(!isFavorited)
        onToggleFavorite(item.id)
    }

    const handleMessageClick = async () => {
        try {
            const conversationsResponse = await axios.get(
                'http://localhost:8080/api/messages',
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            let conversationId
            const existingConversation = conversationsResponse.data.find(
                (conv: { user1: { id: number }; user2: { id: number } }) => (conv.user1.id === item.seller.id || conv.user2.id === item.seller.id)
            )

            if (existingConversation) {
                conversationId = existingConversation.id
            } else {
                const newConversationResponse = await axios.post(
                    'http://localhost:8080/api/messages',
                    { receiverId: item.seller.id },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                conversationId = newConversationResponse.data.id
            }

            await axios.post(
                `http://localhost:8080/api/messages/conversations/${conversationId}/messages`,
                { content: messageContent },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            setIsMessageDialogOpen(false)
            router.push(`/messages?conversation=${conversationId}&otherUserId=${item.seller.id}`)
        } catch (error) {
            console.error('Error handling message click:', error)
            alert('An error occurred while trying to send the message. Please try again.')
        }
    }

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fullImageUrls.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + fullImageUrls.length) % fullImageUrls.length)
    }

    return (
        <>
            <Card
                className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg cursor-pointer"
                onClick={() => setIsFullDetailsOpen(true)}
            >
                <div className="relative h-56">
                    <img
                        src={fullImageUrls[0] || '/placeholder-image.jpg'}
                        alt={`${item.title} - Main Image`}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={handleFavoriteToggle}
                        className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isFavorited ? 'bg-orange-500' : 'bg-white/70 hover:bg-orange-500'
                            } group`}
                    >
                        <Image
                            src="/icons/heart-icon.svg"
                            alt="Favorite"
                            width={16}
                            height={16}
                            className={`${isFavorited ? 'filter invert' : 'group-hover:filter group-hover:invert'}`}
                        />
                    </button>
                </div>
                <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100 h-[calc(100%-14rem)]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{item.title}</h3>
                        <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{new Date(item.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span>{item.seller.firstName} {item.seller.lastName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMessageDialogOpen(true);
                        }}
                    >
                        {`Message ${item.seller.firstName}`}
                    </Button>
                </div>
            </Card>

            <Dialog open={isFullDetailsOpen} onOpenChange={setIsFullDetailsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{item.title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <img
                                src={fullImageUrls[currentImageIndex] || '/placeholder-image.jpg'}
                                alt={`${item.title} - Image ${currentImageIndex + 1}`}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                            {fullImageUrls.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600 mb-2">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <span>Listed on: {new Date(item.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span>Seller: {item.seller.firstName} {item.seller.lastName}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {item.tags.map((tag, index) => (
                                    <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => {
                                    setIsFullDetailsOpen(false)
                                    setIsMessageDialogOpen(true)
                                }}
                            >
                                {`Message ${item.seller.firstName}`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Send a Message</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[100px] mt-4"
                    />
                    <DialogFooter>
                        <Button onClick={handleMessageClick} className="bg-orange-500 hover:bg-orange-600 text-white">
                            Send
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FavoriteItemCard