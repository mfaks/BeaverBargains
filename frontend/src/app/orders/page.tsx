"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import NavBar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FilterSidebar from '../FilterSidebar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OrderItem {
    id: number
    title: string
    price: number
    seller: {
        firstName: string
        lastName: string
    }
    purchaseDate: string
    imageUrls: string[]
    tags: string[]
}

export default function Orders() {
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([])
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(Infinity)
    const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: number]: number }>({})
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get<OrderItem[]>('http://localhost:8080/api/items/user/purchased', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })

                setOrders(response.data)
                setFilteredOrders(response.data)

                if (response.data.length > 0) {
                    const prices = response.data.map(item => item.price)
                    setMinPrice(Math.min(...prices))
                    setMaxPrice(Math.max(...prices))
                }

                // Initialize current image indices
                const initialIndices = response.data.reduce((acc, item) => {
                    acc[item.id] = 0
                    return acc
                }, {} as { [key: number]: number })
                setCurrentImageIndices(initialIndices)

                // Collect all unique tags
                const tags = new Set(response.data.flatMap(item => item.tags))
                setAllTags(Array.from(tags))
            } catch (error) {
                console.error('Error fetching purchase history:', error)
            }
        }

        fetchOrders()
    }, [])

    const handleSort = (sortBy: string) => {
        let sorted = [...filteredOrders]
        switch (sortBy) {
            case 'price_asc':
                sorted.sort((a, b) => a.price - b.price)
                break
            case 'price_desc':
                sorted.sort((a, b) => b.price - a.price)
                break
            case 'date_desc':
                sorted.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                break
            case 'date_asc':
                sorted.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime())
                break
            default:
                break
        }
        setFilteredOrders(sorted)
    }

    const handlePriceFilter = (min: number, max: number) => {
        filterOrders(min, max, selectedTags)
    }

    const handleDescriptionSearch = (term: string) => {
        const filtered = orders.filter(order =>
            order.title.toLowerCase().includes(term.toLowerCase()) ||
            order.seller.firstName.toLowerCase().includes(term.toLowerCase()) ||
            order.seller.lastName.toLowerCase().includes(term.toLowerCase())
        )
        setFilteredOrders(filtered)
    }

    const handleTagSearch = (term: string) => {
        const filtered = orders.filter(order =>
            order.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
        )
        setFilteredOrders(filtered)
    }


    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        filterOrders(minPrice, maxPrice, tags)
    }

    const filterOrders = (minPrice: number, maxPrice: number, tags: string[]) => {
        const filtered = orders.filter(order =>
            order.price >= minPrice &&
            order.price <= maxPrice &&
            (tags.length === 0 || tags.every(tag => order.tags.includes(tag)))
        )
        setFilteredOrders(filtered)
    }

    const getFullImageUrl = (imageUrl: string) => {
        const BASE_URL = 'http://localhost:8080'
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    const nextImage = (orderId: number) => {
        setCurrentImageIndices(prevIndices => ({
            ...prevIndices,
            [orderId]: (prevIndices[orderId] + 1) % orders.find(order => order.id === orderId)!.imageUrls.length
        }))
    }

    const prevImage = (orderId: number) => {
        setCurrentImageIndices(prevIndices => ({
            ...prevIndices,
            [orderId]: (prevIndices[orderId] - 1 + orders.find(order => order.id === orderId)!.imageUrls.length) % orders.find(order => order.id === orderId)!.imageUrls.length
        }))
    }

    return (
        <div className='flex flex-col min-h-[100dvh] bg-orange-50 text-[#black]'>
            <NavBar />
            <div className="flex flex-1 overflow-hidden mb-10">
                <aside className="w-64 bg-orange-50 flex-shrink-0">
                    <FilterSidebar
                        sortOptions={[
                            { label: 'Price: Low to High', value: 'price_asc' },
                            { label: 'Price: High to Low', value: 'price_desc' },
                            { label: 'Recent Purchases', value: 'date_desc' },
                            { label: 'Oldest Purchases', value: 'date_asc' }
                        ]}
                        priceFilter={true}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onSort={handleSort}
                        onPriceFilter={handlePriceFilter}
                        onDescriptionSearch={handleDescriptionSearch}
                        onTagSearch={handleTagSearch}
                        onTagFilter={handleTagFilter}
                        allTags={allTags}
                    />
                </aside>
                <ScrollArea className='flex-1'>
                    <main className='container mx-auto px-4 md:px-6 py-12'>
                        <div className='flex justify-center mb-6'>
                            <h1 className='text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1'>
                                My Purchase History
                            </h1>
                        </div>
                        {filteredOrders.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => (
                                    <Card key={order.id} className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg">
                                        <div className="relative h-56">
                                            <img
                                                src={getFullImageUrl(order.imageUrls[currentImageIndices[order.id]])}
                                                alt={`${order.title} - Image ${currentImageIndices[order.id] + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {order.imageUrls.length > 1 && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            prevImage(order.id);
                                                        }}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            nextImage(order.id);
                                                        }}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                        <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100 h-[calc(100%-14rem)]">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">{order.title}</h3>
                                                <span className="text-xl font-bold text-orange-600">${order.price.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                <span>{new Date(order.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                <span>{order.seller.firstName} {order.seller.lastName}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {order.tags.map((tag, index) => (
                                                    <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">You haven't purchased any items yet.</p>
                        )}
                    </main>
                </ScrollArea>
            </div>
            <Footer />
        </div>
    )
}