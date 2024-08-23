"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import NavBar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FilterSidebar from '../../components/ui/FilterSidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import OrderItemCard from './OrderItemCard'
import { OrderItem } from '@/types/OrderItem'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import EmptyStateCard from '@/components/ui/EmptyStateCard'
import { FaSearch, FaShoppingBag } from 'react-icons/fa'
import { useAuth } from '../../components/auth/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export default function Orders() {
    const { isAuthenticated, user, token } = useAuth()
    const { toast } = useToast()
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([])
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(0)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
    const [originalMinPrice, setOriginalMinPrice] = useState<number>(0)
    const [originalMaxPrice, setOriginalMaxPrice] = useState<number>(0)
    const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: number]: number }>({})
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [descriptionSearch, setDescriptionSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [resetTrigger, setResetTrigger] = useState(0)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        } else {
            fetchOrders()
        }
    }, [isAuthenticated, loading, user, router])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const response = await axios.get<OrderItem[]>('https://beaverbargains.onrender.com/api/items/user/purchased', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            setOrders(response.data)
            setFilteredOrders(response.data)

            if (response.data.length > 0) {
                const prices = response.data.map(item => item.price)
                const minItemPrice = Math.min(...prices)
                const maxItemPrice = Math.max(...prices)
                setMinPrice(minItemPrice)
                setMaxPrice(maxItemPrice)
                setOriginalMinPrice(minItemPrice)
                setOriginalMaxPrice(maxItemPrice)
                setPriceRange([minItemPrice, maxItemPrice])
            }

            const initialIndices = response.data.reduce((acc, item) => {
                acc[item.id] = 0
                return acc
            }, {} as { [key: number]: number })
            setCurrentImageIndices(initialIndices)

            const tags = new Set(response.data.flatMap(item => item.tags))
            setAllTags(Array.from(tags))
        } catch (error) {
            console.error('Error fetching purchase history:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch purchase history. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

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
        setPriceRange([min, max])
        applyFilters(descriptionSearch, selectedTags, min, max)
    }

    const handleDescriptionSearch = (term: string) => {
        setDescriptionSearch(term)
        applyFilters(term, selectedTags, priceRange[0], priceRange[1])
    }

    const handleTagSearch = (term: string) => {
        setTagSearch(term)
    }

    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        applyFilters(descriptionSearch, tags, priceRange[0], priceRange[1])
    }

    const applyFilters = (descSearch: string, tags: string[], min: number, max: number) => {
        let filtered = orders

        if (descSearch) {
            filtered = filtered.filter(order =>
                order.title.toLowerCase().includes(descSearch.toLowerCase()) ||
                order.seller.firstName.toLowerCase().includes(descSearch.toLowerCase()) ||
                order.seller.lastName.toLowerCase().includes(descSearch.toLowerCase())
            )
        }

        if (tags.length > 0) {
            filtered = filtered.filter(order =>
                tags.every(tag => order.tags.includes(tag))
            )
        }

        filtered = filtered.filter(order =>
            order.price >= min && order.price <= max
        )

        setFilteredOrders(filtered)
    }

    const getFullImageUrl = (imageUrl: string) => {
        const BASE_URL = 'https://beaverbargains.onrender.com'
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

    const handleClearFilters = () => {
        setDescriptionSearch('')
        setTagSearch('')
        setSelectedTags([])
        setPriceRange([originalMinPrice, originalMaxPrice])
        setResetTrigger(prev => prev + 1)
        setFilteredOrders(orders)
    }

    return (
        <div>
            {isAuthenticated ? (
                <div className='flex flex-col min-h-[100dvh] bg-orange-50 text-[#black]'>
                    <NavBar />
                    <div className="flex flex-1 overflow-hidden">
                        <aside className="w-64 bg-orange-50 flex-shrink-0 border-r border-orange-200">
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
                                priceRange={priceRange}
                                onSort={handleSort}
                                onPriceFilter={handlePriceFilter}
                                onDescriptionSearch={handleDescriptionSearch}
                                onTagSearch={handleTagSearch}
                                onTagFilter={handleTagFilter}
                                allTags={allTags}
                                resetTrigger={resetTrigger}
                            />
                        </aside>
                        <ScrollArea className='flex-1'>
                            <main className='container mx-auto px-4 md:px-6 py-12'>
                                <div className='flex justify-center mb-6'>
                                    <h1 className='text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1'>
                                        My Order History
                                    </h1>
                                </div>
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {[...Array(6)].map((_, index) => (
                                            <SkeletonCard key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    filteredOrders.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            {filteredOrders.map((order) => (
                                                <OrderItemCard
                                                    key={order.id}
                                                    order={order}
                                                    currentImageIndex={currentImageIndices[order.id]}
                                                    onPrevImage={() => prevImage(order.id)}
                                                    onNextImage={() => nextImage(order.id)}
                                                    getFullImageUrl={getFullImageUrl}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyStateCard
                                            title={orders.length > 0 ? 'No orders found' : 'No purchase history'}
                                            description={
                                                orders.length > 0
                                                    ? 'There are no orders matching your current filters.'
                                                    : 'You haven\'t made any purchases yet. Start shopping to see your order history!'
                                            }
                                            actionText={orders.length > 0 ? 'Clear Filters' : 'Go to Marketplace'}
                                            onAction={orders.length > 0 ? handleClearFilters : () => router.push('/marketplace')}
                                            icon={orders.length > 0 ? <FaSearch className="text-orange-500 text-5xl" /> : <FaShoppingBag className="text-orange-500 text-5xl" />}
                                        />
                                    )
                                )}
                            </main>
                        </ScrollArea>
                    </div>
                    <Footer />
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}