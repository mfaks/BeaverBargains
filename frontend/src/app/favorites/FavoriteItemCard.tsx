"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FavoriteItemCardProps } from '@/types/FavoriteItemCard'


const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({ item, onToggleFavorite, getFullImageUrl }) => {
    const [isFavorited, setIsFavorited] = useState(item.isFavorited)

    useEffect(() => {
        setIsFavorited(item.isFavorited)
    }, [item.isFavorited])

    const handleFavoriteToggle = () => {
        setIsFavorited(!isFavorited)
        onToggleFavorite(item.id)
    }

    return (
        <Card className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg">
           <div className="relative">
                <img 
                    src={getFullImageUrl(item.imageUrl)} 
                    alt={item.title} 
                    className="w-full h-64 object-cover"
                />
                <button 
                    onClick={handleFavoriteToggle}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                        isFavorited ? 'bg-orange-500' : 'bg-white/70 hover:bg-orange-500'
                    } group`}
                >
                    <Image 
                        src="/icons/heart-icon.svg"
                        alt="Favorite"
                        width={20}
                        height={20}
                        className={`${isFavorited ? 'filter invert' : 'group-hover:filter group-hover:invert'}`}
                    />
                </button>
            </div>
            <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                    <span className="text-2xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {item.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                        <Image 
                            src="/icons/calendar-icon.svg"
                            alt="Calendar"
                            width={16}
                            height={16}
                        />
                        <span>{new Date(item.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image 
                            src="/icons/user-icon.svg"
                            alt="User"
                            width={16}
                            height={16}
                        />
                        <span>{item.seller.firstName} {item.seller.lastName}</span>
                    </div>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center">
                    <Image 
                        src="/icons/user-icon.svg"
                        alt="Message"
                        width={16}
                        height={16}
                        className="mr-2 invert"
                    />
                    Message {item.seller.firstName}
                </Button>
            </div>
        </Card>
    )
}

export default FavoriteItemCard