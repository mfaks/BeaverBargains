"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import FilterSidebar from '../FilterSidebar'
import ListingItemCard from './ListingItemCard'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { useToast } from '@/components/ui/use-toast'
import EmptyStateCard from '@/components/ui/EmptyStateCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FaClipboardList } from 'react-icons/fa'
import { Item } from '@/types/Item'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Listings() {
    const [activeItems, setActiveItems] = useState<Item[]>([])
    const [soldItems, setSoldItems] = useState<Item[]>([])
    const [filteredItems, setFilteredItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(Infinity)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('active')
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setErrorMessage('You must be logged in to access your listings. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push(`/login`)
            }, 2000)
        } else {
            fetchItems()
        }
    }, [isAuthenticated, token, router])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const activeResponse = await axios.get<Item[]>(`http://localhost:8080/api/items/user/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const soldResponse = await axios.get<Item[]>(`http://localhost:8080/api/items/user/sold`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            setActiveItems(activeResponse.data)
            setSoldItems(soldResponse.data)
            setFilteredItems(activeResponse.data)

            if (activeResponse.data.length > 0) {
                const prices = activeResponse.data.map(item => item.price)
                setMinPrice(Math.min(...prices))
                setMaxPrice(Math.max(...prices))
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch your listed items. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    const toggleSelectItem = (itemId: number) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    const handleItemUpdate = (updatedItem: Item) => {
        if (updatedItem.status === 'ACTIVE') {
            setActiveItems(prev => [...prev, updatedItem])
            setSoldItems(prev => prev.filter(item => item.id !== updatedItem.id))
        } else if (updatedItem.status === 'SOLD') {
            setActiveItems(prev => prev.filter(item => item.id !== updatedItem.id))
            setSoldItems(prev => [...prev, updatedItem])
        }
        setFilteredItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
    }


    const handleMarkAsSold = async (itemId: number) => {
        try {
            const response = await axios.put<Item>(`http://localhost:8080/api/items/${itemId}/mark-as-sold`, null, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            const updatedItem = response.data
            setActiveItems(prev => prev.filter(item => item.id !== itemId))
            setSoldItems(prev => [...prev, updatedItem])
            setFilteredItems(prev => prev.filter(item => item.id !== itemId))

            toast({
                title: 'Success',
                description: 'Item marked as sold successfully.',
                duration: 3000,
            })
        } catch (error) {
            console.error('Error marking item as sold:', error)
            toast({
                title: 'Error',
                description: 'Failed to mark item as sold. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
    }

    const handleSort = (sortBy: string) => {
        let sorted = [...filteredItems]
        switch (sortBy) {
            case 'price_asc':
                sorted.sort((a, b) => a.price - b.price)
                break
            case 'price_desc':
                sorted.sort((a, b) => b.price - a.price)
                break
            case 'date_desc':
                sorted.sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime())
                break
            case 'date_asc':
                sorted.sort((a, b) => new Date(a.listingDate).getTime() - new Date(b.listingDate).getTime())
                break
            default:
                break
        }
        setFilteredItems(sorted)
    }

    const handlePriceFilter = (minPrice: number, maxPrice: number) => {
        const filtered = activeTab === 'active' ? activeItems : soldItems
        const filteredByPrice = filtered.filter(item => item.price >= minPrice && item.price <= maxPrice)
        setFilteredItems(filteredByPrice)
    }

    const handleDateFilter = (startDate: Date, endDate: Date) => {
        const filtered = activeTab === 'active' ? activeItems : soldItems
        const filteredByDate = filtered.filter(item => {
            const itemDate = new Date(item.listingDate)
            return itemDate >= startDate && itemDate <= endDate
        })
        setFilteredItems(filteredByDate)
    }

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        const items = activeTab === 'active' ? activeItems : soldItems
        const filtered = items.filter(item =>
            item.description.toLowerCase().includes(term.toLowerCase()) ||
            item.title.toLowerCase().includes(term.toLowerCase())
        )
        setFilteredItems(filtered)
    }

    const BASE_URL = `http://localhost:8080`
    const getFullImageUrl = (imageUrl: string) => {
        if (imageUrl.startsWith(`http`)) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    return (
        <div className="flex flex-col min-h-screen bg-orange-50">
            <Navbar />
            <div className="flex flex-1 overflow-hidden mb-10">
                {!loading && filteredItems.length > 0 && (
                    <aside className="w-64 bg-orange-50 flex-shrink-0">
                        <FilterSidebar
                            sortOptions={[
                                { label: 'Price: Low to High', value: 'price_asc' },
                                { label: 'Price: High to Low', value: 'price_desc' },
                                { label: 'Newest First', value: 'date_desc' },
                                { label: 'Oldest First', value: 'date_asc' }
                            ]}
                            priceFilter={true}
                            dateFilter={true}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onSort={handleSort}
                            onPriceFilter={handlePriceFilter}
                            onDateFilter={handleDateFilter}
                            onSearch={handleSearch}
                        />
                    </aside>
                )}
                <main className="flex-1 overflow-y-auto pl-0 pr-6 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-6">
                            <h1 className="text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1">
                                Your Listings
                            </h1>
                        </div>
                        <Tabs defaultValue="active" className="w-full mb-6">
                            <TabsList>
                                <TabsTrigger
                                    value="active"
                                    onClick={() => {
                                        setActiveTab('active')
                                        setFilteredItems(activeItems)
                                    }}
                                >
                                    Active Listings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sold"
                                    onClick={() => {
                                        setActiveTab('sold')
                                        setFilteredItems(soldItems)
                                    }}
                                >
                                    Sold Items
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="active">
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {[...Array(6)].map((_, index) => (
                                            <SkeletonCard key={index} />
                                        ))}
                                    </div>
                                ) : activeItems.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {filteredItems.map(item => (
                                            <ListingItemCard
                                                key={item.id}
                                                item={item}
                                                getFullImageUrl={getFullImageUrl}
                                                isSelected={selectedItems.includes(item.id)}
                                                onToggleSelect={() => toggleSelectItem(item.id)}
                                                token={token}
                                                onItemUpdate={handleItemUpdate}
                                                onMarkAsSold={handleMarkAsSold}
                                                isSold={item.status === 'SOLD'}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCard
                                        title="No active listings"
                                        description="You don't have any active listings. Start selling to see your listings here!"
                                        actionText="Create Listing"
                                        onAction={() => router.push('/sell')}
                                        icon={<FaClipboardList className="text-orange-500" />}
                                    />
                                )}
                            </TabsContent>
                            <TabsContent value="sold">
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {[...Array(6)].map((_, index) => (
                                            <SkeletonCard key={index} />
                                        ))}
                                    </div>
                                ) : soldItems.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {filteredItems.map(item => (
                                            <ListingItemCard
                                                key={item.id}
                                                item={item}
                                                getFullImageUrl={getFullImageUrl}
                                                isSelected={selectedItems.includes(item.id)}
                                                onToggleSelect={() => toggleSelectItem(item.id)}
                                                token={token}
                                                onItemUpdate={handleItemUpdate}
                                                onMarkAsSold={handleMarkAsSold}
                                                isSold={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCard
                                        title="No sold items"
                                        description="You haven't sold any items yet. Keep listing and promoting your items!"
                                        actionText="View Active Listings"
                                        onAction={() => {
                                            setActiveTab('active')
                                            setFilteredItems(activeItems)
                                        }}
                                        icon={<FaClipboardList className="text-orange-500" />}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}