"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { OrderHistoryCardProps } from '@/types/OrderHistoryCard'

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order, currentImageIndex, onPrevImage, onNextImage, getFullImageUrl }) => {
    return (
        <Card className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-56">
                <img
                    src={getFullImageUrl(order.imageUrls[currentImageIndex])}
                    alt={`${order.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                />
                {order.imageUrls.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                onPrevImage()
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                onNextImage()
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
            <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{order.title}</h3>
                    <span className="text-xl font-bold text-orange-600">${order.price.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                    <p><strong>Purchased on:</strong> {new Date(order.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Seller:</strong> {order.seller.firstName} {order.seller.lastName}</p>
                    <p><strong>Seller Listed on:</strong> {new Date(order.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                    {order.tags.map((tag, index) => (
                        <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export default OrderHistoryCard