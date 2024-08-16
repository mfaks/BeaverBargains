"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react'
import { OrderItemCardProps } from '@/types/OrderItemCardProps'

const OrderItemCard: React.FC<OrderItemCardProps> = ({ order, currentImageIndex, onPrevImage, onNextImage, getFullImageUrl }) => {
    return (
        <Card
            className="w-full h-auto rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 border-orange-300 flex flex-col"
        >
            <div className="relative h-48 flex-shrink-0">
                <img
                    src={getFullImageUrl(order.imageUrls[currentImageIndex])}
                    alt={`${order.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                />
                {order.imageUrls.length > 1 && (
                    <div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white rounded-full p-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                onPrevImage()
                            }}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white rounded-full p-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                onNextImage()
                            }}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="p-3 bg-gradient-to-b from-gray-50 to-gray-100 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-800 truncate">{order.title}</h3>
                        <span className="text-lg font-bold text-orange-600">${order.price.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                        <div className="flex items-center mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Purchased: {new Date(order.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center mb-1">
                            <User className="h-3 w-3 mr-1" />
                            <span>Seller: {order.seller.firstName} {order.seller.lastName}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Listed On: {new Date(order.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {order.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                        {order.tags.length > 3 && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                                +{order.tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 mt-1"
                >
                    View Details
                </Button>
            </div>
        </Card>
    )
}

export default OrderItemCard