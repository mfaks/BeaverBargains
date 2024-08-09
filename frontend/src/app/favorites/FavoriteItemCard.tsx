"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteItemCardProps } from '@/types/FavoriteItemCard'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({ item, onToggleFavorite, getFullImageUrl }) => {
    const router = useRouter()
    const { user, token } = useAuth()
    const [isFavorited, setIsFavorited] = useState(item.isFavorited)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [messageContent, setMessageContent] = useState(`Hi ${item.seller.firstName}, my name is ${user?.firstName} and I'm interested in your item: ${item.title}`)

    useEffect(() => {
        setIsFavorited(item.isFavorited)
    }, [item.isFavorited])

    const handleFavoriteToggle = () => {
        setIsFavorited(!isFavorited)
        onToggleFavorite(item.id)
    }

    const handleMessageClick = async () => {
        try {
            const conversationResponse = await axios.post(
                'http://localhost:8080/api/messages',
                { receiverId: item.seller.id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            const conversationId = conversationResponse.data.id
    
            await axios.post(
                `http://localhost:8080/api/messages/conversations/${conversationId}/messages`,
                { content: messageContent },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
    
            setIsDialogOpen(false)
            router.push(`/messages?conversation=${conversationId}&otherUserId=${item.seller.id}`)
        } catch (error) {
            console.error('Error handling message click:', error)
            alert('An error occurred while trying to send the message. Please try again.')
        }
    }

    return (
        <Card className='w-full max-w-sm rounded-lg overflow-hidden shadow-lg'>
            <div className='relative h-56'>
                <img
                    src={getFullImageUrl(item.imageUrl)}
                    alt={item.title}
                    className='w-full h-full object-cover'
                />
                <button
                    onClick={handleFavoriteToggle}
                    className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isFavorited ? 'bg-orange-500' : 'bg-white/70 hover:bg-orange-500'
                        } group`}
                >
                    <Image
                        src='/icons/heart-icon.svg'
                        alt='Favorite'
                        width={16}
                        height={16}
                        className={`${isFavorited ? 'filter invert' : 'group-hover:filter group-hover:invert'}`}
                    />
                </button>
            </div>
            <div className='p-4 bg-gradient-to-b from-gray-50 to-gray-100 h-[calc(100%-14rem)]'>
                <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-lg font-semibold text-gray-800 truncate'>{item.title}</h3>
                    <span className='text-xl font-bold text-orange-600'>${item.price.toFixed(2)}</span>
                </div>
                <p className='text-xs text-gray-600 mb-2 line-clamp-2'>
                    {item.description}
                </p>
                <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                    <div className='flex items-center gap-1'>
                        <Image
                            src='/icons/calendar-icon.svg'
                            alt='Calendar'
                            width={12}
                            height={12}
                        />
                        <span>{new Date(item.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <Image
                            src='/icons/user-icon.svg'
                            alt='User'
                            width={12}
                            height={12}
                        />
                        <span>{item.seller.firstName} {item.seller.lastName}</span>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className='w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-full transition-colors flex items-center justify-center text-sm'>
                            <Image
                                src='/icons/user-icon.svg'
                                alt='Message'
                                width={12}
                                height={12}
                                className='mr-1 invert'
                            />
                            Message {item.seller.firstName}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send a Message</DialogTitle>
                        </DialogHeader>
                        <Input
                            type="text"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full mt-4"
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
            </div>
        </Card>
    )
}

export default FavoriteItemCard
