"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/auth/AuthContext'
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
import BeaverIcon from '@/components/ui/BeaverIcon'

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
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showNoResultsModal, setShowNoResultsModal] = useState(false)
    const [resetTrigger, setResetTrigger] = useState(0)

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

    useEffect(() => {
        setFilteredItems(activeTab === 'active' ? activeItems : soldItems)
    }, [activeTab, activeItems, soldItems])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const activeResponse = await axios.get<Item[]>(`http://localhost:8080/api/items/user/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const soldResponse = await axios.get<Item[]>(`http://localhost:8080/api/items/user/sold`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const activeItems = activeResponse.data
            const soldItems = soldResponse.data

            const tags = new Set([
                ...activeItems.flatMap(item => item.tags || []),
                ...soldItems.flatMap(item => item.tags || [])
            ])
            setAllTags(Array.from(tags))

            setActiveItems(activeItems)
            setSoldItems(soldItems)
            setFilteredItems(activeItems)

            if (activeItems.length > 0) {
                const prices = activeItems.map(item => item.price)
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

    const handleFilters = () => {
        const items = activeTab === 'active' ? activeItems : soldItems
        const filtered = items.filter(item =>
            (selectedTags.length === 0 || selectedTags.every(tag => item.tags.includes(tag))) &&
            item.price >= minPrice &&
            item.price <= maxPrice &&
            (item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        )
        setFilteredItems(filtered)
        setShowNoResultsModal(filtered.length === 0)
    }

    const handleDescriptionSearch = (term: string) => {
        setSearchTerm(term)
        handleFilters()
    }

    const handleTagSearch = (term: string) => {
        setSearchTerm(term)
        handleFilters()
    }

    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        handleFilters()
    }

    const handlePriceFilter = (min: number, max: number) => {
        setMinPrice(min)
        setMaxPrice(max)
        handleFilters()
    }

    const clearFilters = () => {
        setMinPrice(0)
        setMaxPrice(Infinity)
        setSearchTerm('')
        setSelectedTags([])
        setFilteredItems(activeTab === 'active' ? activeItems : soldItems)
        setShowNoResultsModal(false)
        setResetTrigger(prev => prev + 1)
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

    const handleMarkAsSold = async (itemId: number, buyerId: number, purchaseDate: string) => {
        const formattedDate = purchaseDate.replace('Z', '')
        try {
            const response = await axios.put<Item>(
                `http://localhost:8080/api/items/${itemId}/mark-as-sold?buyerId=${buyerId}&purchaseDate=${encodeURIComponent(formattedDate)}`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )
            const updatedItem = response.data
            setActiveItems(prev => prev.filter(item => item.id !== itemId))
            setSoldItems(prev => [...prev, updatedItem])
            setFilteredItems(prev =>
                activeTab === 'active'
                    ? prev.filter(item => item.id !== itemId)
                    : [...prev, updatedItem]
            )

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
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-orange-50 flex-shrink-0 border-r border-orange-200">
                    <FilterSidebar
                        sortOptions={[
                            { label: 'Price: Low to High', value: 'price_asc' },
                            { label: 'Price: High to Low', value: 'price_desc' },
                            { label: 'Newest First', value: 'date_desc' },
                            { label: 'Oldest First', value: 'date_asc' }
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
                        resetTrigger={resetTrigger}
                    />
                </aside>
                <main className="flex-1 overflow-y-auto">
                    <div className="bg-orange-100 py-4 w-full sticky top-0 z-10">
                        <div className="max-w-6xl mx-auto flex items-center justify-center">
                            <BeaverIcon className="text-orange-700 mr-4" />
                            <h1 className="text-2xl font-bold text-center text-orange-700">Your Listing History</h1>
                            <BeaverIcon className="text-orange-700 ml-4" />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto p-6">
                        <Tabs defaultValue="active" className="w-full mb-6">
                            <TabsList className="grid w-full grid-cols-2">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[...Array(8)].map((_, index) => (
                                            <SkeletonCard key={index} />
                                        ))}
                                    </div>
                                ) : filteredItems.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                                isSold={false}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCard
                                        title={activeItems.length > 0 ? "No items found" : "No active listings"}
                                        description={activeItems.length > 0 ? "There are no items matching your current filters." : "You don't have any active listings. Start selling to see your listings here!"}
                                        actionText={activeItems.length > 0 ? "Clear Filters" : "Create Listing"}
                                        onAction={activeItems.length > 0 ? clearFilters : () => router.push('/sell')}
                                        icon={<FaClipboardList className="text-orange-500" />}
                                    />
                                )}
                            </TabsContent>
                            <TabsContent value="sold">
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[...Array(8)].map((_, index) => (
                                            <SkeletonCard key={index} />
                                        ))}
                                    </div>
                                ) : filteredItems.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        title={soldItems.length > 0 ? "No items found" : "No sold items"}
                                        description={soldItems.length > 0 ? "There are no items matching your current filters." : "You haven't sold any items yet. Keep listing and promoting your items!"}
                                        actionText={soldItems.length > 0 ? "Clear Filters" : "View Active Listings"}
                                        onAction={soldItems.length > 0 ? clearFilters : () => setActiveTab('active')}
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