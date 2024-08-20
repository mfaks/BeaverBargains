"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/auth/AuthContext'
import FilterSidebar from '../../components/ui/FilterSidebar'
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
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(0)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
    const [originalMinPrice, setOriginalMinPrice] = useState<number>(0)
    const [originalMaxPrice, setOriginalMaxPrice] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [isTabChanging, setIsTabChanging] = useState(false)
    const [descriptionSearch, setDescriptionSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState('active')
    const [resetTrigger, setResetTrigger] = useState(0)
    const [lastUpdatedItem, setLastUpdatedItem] = useState<Item | null>(null)
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!isAuthenticated || !token) {
            router.push(`/login`)
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

            const allItems = [...activeResponse.data, ...soldResponse.data]

            const uniqueTags = new Set(allItems.flatMap(item => item.tags || []))
            setAllTags(Array.from(uniqueTags))

            if (allItems.length > 0) {
                const prices = allItems.map(item => item.price)
                const minItemPrice = Math.min(...prices)
                const maxItemPrice = Math.max(...prices)
                setMinPrice(minItemPrice)
                setMaxPrice(maxItemPrice)
                setOriginalMinPrice(minItemPrice)
                setOriginalMaxPrice(maxItemPrice)
                setPriceRange([minItemPrice, maxItemPrice])
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

    useEffect(() => {
        if (lastUpdatedItem) {
            const updateItemsList = (items: Item[]) =>
                items.map(item => item.id === lastUpdatedItem.id ? lastUpdatedItem : item)

            setActiveItems(updateItemsList)
            setSoldItems(updateItemsList)
            setFilteredItems(updateItemsList)

            const updatedTags = new Set([...allTags, ...(lastUpdatedItem.tags || [])])
            setAllTags(Array.from(updatedTags))

            const allItems = [...activeItems, ...soldItems, lastUpdatedItem]
            const allPrices = allItems.map(item => item.price)
            const newMinPrice = Math.min(...allPrices)
            const newMaxPrice = Math.max(...allPrices)

            if (newMinPrice !== minPrice || newMaxPrice !== maxPrice) {
                setMinPrice(newMinPrice)
                setMaxPrice(newMaxPrice)
                setOriginalMinPrice(newMinPrice)
                setOriginalMaxPrice(newMaxPrice)
                setPriceRange([newMinPrice, newMaxPrice])
            }

            setLastUpdatedItem(null)
        }
    }, [lastUpdatedItem, activeItems, soldItems, allTags, minPrice, maxPrice])

    const handleDescriptionSearch = (term: string) => {
        setDescriptionSearch(term)
        const itemsToFilter = activeTab === 'active' ? activeItems : soldItems
        applyFilters(term, selectedTags, priceRange[0], priceRange[1], itemsToFilter)
    }

    const handleTagSearch = (term: string) => {
        setTagSearch(term)
    }

    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        const itemsToFilter = activeTab === 'active' ? activeItems : soldItems
        applyFilters(descriptionSearch, tags, priceRange[0], priceRange[1], itemsToFilter)
    }

    const handlePriceFilter = (min: number, max: number) => {
        setPriceRange([min, max])
        const itemsToFilter = activeTab === 'active' ? activeItems : soldItems
        applyFilters(descriptionSearch, selectedTags, min, max, itemsToFilter)
    }

    const applyFilters = (descSearch: string, tags: string[], min: number, max: number, items: Item[]) => {
        let filtered = items

        if (descSearch) {
            filtered = filtered.filter(item =>
                item.description.toLowerCase().includes(descSearch.toLowerCase()) ||
                item.title.toLowerCase().includes(descSearch.toLowerCase())
            )
        }

        if (tags.length > 0) {
            filtered = filtered.filter(item =>
                tags.every(tag => item.tags.includes(tag))
            )
        }

        filtered = filtered.filter(item =>
            item.price >= min && item.price <= max
        )

        setFilteredItems(filtered)
    }

    const handleClearFilters = () => {
        setDescriptionSearch('')
        setTagSearch('')
        setSelectedTags([])
        setPriceRange([originalMinPrice, originalMaxPrice])
        setResetTrigger(prev => prev + 1)
        const itemsToFilter = activeTab === 'active' ? activeItems : soldItems
        setFilteredItems(itemsToFilter)
    }

    const toggleSelectItem = (itemId: number) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    const handleItemUpdate = async (updatedItem: Item) => {
        try {
            const updateItemsList = (items: Item[]) =>
                items.map(item => item.id === updatedItem.id ? updatedItem : item)

            setActiveItems(updateItemsList)
            setSoldItems(updateItemsList)
            setFilteredItems(updateItemsList)

            const updatedTags = new Set([...allTags, ...(updatedItem.tags || [])])
            setAllTags(Array.from(updatedTags))

            const allItems = [...activeItems, ...soldItems]
            const allPrices = allItems.map(item => item.price)
            const newMinPrice = Math.min(...allPrices, updatedItem.price)
            const newMaxPrice = Math.max(...allPrices, updatedItem.price)

            if (newMinPrice !== minPrice || newMaxPrice !== maxPrice) {
                setMinPrice(newMinPrice)
                setMaxPrice(newMaxPrice)
                setOriginalMinPrice(newMinPrice)
                setOriginalMaxPrice(newMaxPrice)
                setPriceRange([newMinPrice, newMaxPrice])
            }

            toast({
                title: 'Success',
                description: 'Item details updated successfully.',
                duration: 3000,
            })
        } catch (error) {
            console.error('Error updating item details:', error)
            toast({
                title: 'Error',
                description: 'Failed to update item details. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
    }

    const handleMarkAsSold = async (itemId: number, buyerId: number, purchaseDate: string) => {
        const formattedDate = purchaseDate.replace('Z', '')
        try {
            const response = await axios.put<Item>(
                `http://localhost:8080/api/items/${itemId}/mark-as-sold?buyerId=${buyerId}&purchaseDate=${encodeURIComponent(formattedDate)}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            const updatedItem = response.data

            setActiveItems(prev => prev.filter(item => item.id !== updatedItem.id))
            setSoldItems(prev => [...prev, updatedItem])
            setFilteredItems(prev => prev.filter(item => item.id !== updatedItem.id))

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

    const handleTabChange = (newTab: string) => {
        setIsTabChanging(true)
        setActiveTab(newTab)
        const itemsToFilter = newTab === 'active' ? activeItems : soldItems
        applyFilters(descriptionSearch, selectedTags, priceRange[0], priceRange[1], itemsToFilter)
        setIsTabChanging(false)
    }

    const BASE_URL = `http://localhost:8080`
    const getFullImageUrl = (imageUrl: string) => {
        if (imageUrl.startsWith(`http`)) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    return (
        <div>
            {isAuthenticated ? (
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
                                            onClick={() => handleTabChange('active')}
                                        >
                                            Active Listings
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="sold"
                                            onClick={() => handleTabChange('sold')}
                                        >
                                            Sold Items
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="active" className={`tab-content ${isTabChanging ? 'loading' : ''}`}>
                                        {loading || isTabChanging ? (
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
                                                onAction={activeItems.length > 0 ? handleClearFilters : () => router.push('/sell')}
                                                icon={<FaClipboardList className="text-orange-500" />}
                                            />
                                        )}
                                    </TabsContent>
                                    <TabsContent value="sold" className={`tab-content ${isTabChanging ? 'loading' : ''}`}>
                                        {loading || isTabChanging ? (
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
                                                onAction={soldItems.length > 0 ? handleClearFilters : () => handleTabChange('active')}
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
            ) : (
                <div></div>
            )}
        </div>
    )
}