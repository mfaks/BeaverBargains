'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import MarketplaceItemCard from './MarketplaceItemCard'
import FilterSidebar from '../FilterSidebar'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'
import { useToast } from '@/components/ui/use-toast'
import EmptyStateCard from '@/components/ui/EmptyStateCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FaShoppingBasket } from 'react-icons/fa'
import { Item } from '@/types/Item'
import BeaverIcon from '@/components/ui/BeaverIcon'

export default function Marketplace({ searchQuery }: { searchQuery: string }) {
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [allItems, setAllItems] = useState<Item[]>([])
    const [filteredItems, setFilteredItems] = useState<Item[]>([])
    const [favorites, setFavorites] = useState<number[]>([])
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(Infinity)
    const [originalMinPrice, setOriginalMinPrice] = useState<number>(0)
    const [originalMaxPrice, setOriginalMaxPrice] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [descriptionSearch, setDescriptionSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery)

    if (!isAuthenticated) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
    }

    const BASE_URL = `http://localhost:8080`
    const getFullImageUrl = (imageUrls: string | string[]): string[] => {
        const processUrl = (url: string) => url.startsWith('http') ? url : `${BASE_URL}/uploads/${url}`

        if (Array.isArray(imageUrls)) {
            return imageUrls.map(processUrl)
        }
        return [processUrl(imageUrls)]
    }

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to access the marketplace. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            fetchItems(searchQuery)
            fetchFavorites()
        }
    }, [isAuthenticated, router, searchQuery])

    const fetchItems = async (query = '', tags: string[] = selectedTags, tgSearch = tagSearch) => {
        setLoading(true)
        try {
            let url = 'http://localhost:8080/api/items/search'
            const params = new URLSearchParams()
            if (query) params.append('query', query)
            if (tgSearch) params.append('tagSearch', tgSearch)
            tags.forEach(tag => params.append('tags', tag))

            const response = await axios.get<Item[]>(`${url}?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const favoritesResponse = await axios.get<number[]>('http://localhost:8080/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const items = response.data.map(item => ({
                ...item,
                isFavorited: favoritesResponse.data.includes(item.id)
            }))

            setAllItems(items)
            setFilteredItems(items)

            const uniqueTags = new Set(items.flatMap(item => item.tags || []))
            setAllTags(Array.from(uniqueTags))

            if (items.length > 0) {
                const prices = items.map(item => item.price)
                const minItemPrice = Math.min(...prices)
                const maxItemPrice = Math.max(...prices)
                setMinPrice(minItemPrice)
                setMaxPrice(maxItemPrice)
                setOriginalMinPrice(minItemPrice)
                setOriginalMaxPrice(maxItemPrice)
            }

            setLoading(false)

            if ((query || tags.length > 0 || tgSearch) && items.length === 0) {
                toast({
                    title: 'No Results',
                    description: `No items matching your criteria were found.`,
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch items. Please login to your account or refresh the page.',
                variant: 'destructive',
                duration: 5000,
            })
            setLoading(false)
        }
    }

    const fetchFavorites = async () => {
        try {
            const response = await axios.get<number[]>('http://localhost:8080/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setFavorites(response.data)
        } catch (error) {
            console.error('Error fetching favorites:', error)
        }
    }

    const toggleFavorite = async (itemId: number) => {
        try {
            if (favorites.includes(itemId)) {
                await axios.delete(`http://localhost:8080/api/favorites/${itemId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                setFavorites(favorites.filter(id => id !== itemId))
            } else {
                await axios.post(`http://localhost:8080/api/favorites`, { itemId }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                setFavorites([...favorites, itemId])
            }

            const updateItems = (items: Item[]) =>
                items.map(item =>
                    item.id === itemId ? { ...item, isFavorited: !item.isFavorited } : item
                )

            setAllItems(updateItems)
            setFilteredItems(updateItems)
        } catch (error) {
            console.error('Error toggling favorite:', error)
            toast({
                title: 'Error',
                description: 'Failed to update favorite. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
    }

    const handleDescriptionSearch = (term: string) => {
        setDescriptionSearch(term)
        applyFilters(term, selectedTags, minPrice, maxPrice)
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

    const handlePriceFilter = (min: number, max: number) => {
        setMinPrice(min)
        setMaxPrice(max)
        applyFilters(descriptionSearch, selectedTags, min, max)
    }

    const handleTagSearch = (term: string) => {
        setTagSearch(term)
    }

    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        applyFilters(descriptionSearch, tags, minPrice, maxPrice)
    }

    const applyFilters = (descSearch: string, tags: string[], min: number, max: number) => {
        let filtered = allItems

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

    const [resetTrigger, setResetTrigger] = useState(0)

    const handleClearFilters = () => {
        setDescriptionSearch('')
        setTagSearch('')
        setSelectedTags([])
        setMinPrice(originalMinPrice)
        setMaxPrice(originalMaxPrice)
        setResetTrigger(prev => prev + 1)
        setFilteredItems(allItems)
        setCurrentSearchQuery('')
        router.push('/marketplace')
    }

    return (
        <div className='flex flex-col min-h-screen bg-orange-50 text-orange-500'>
            <Navbar searchQuery={currentSearchQuery} />
            <div className='flex flex-1 overflow-hidden'>
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
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <div className='bg-orange-100 py-4 mb-6 flex items-center justify-center'>
                        <BeaverIcon className='text-orange-700 mr-4' />
                        <h1 className='text-2xl font-bold text-center text-orange-700'> Welcome to the Marketplace </h1>
                        <BeaverIcon className='text-orange-700 ml-4' />
                    </div>
                    <main className='flex-1 overflow-y-auto pl-0 pr-6 py-6'>
                        <div className='max-w-6xl mx-auto'>
                            {loading ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                                    {[...Array(8)].map((_, index) => (
                                        <SkeletonCard key={index} />
                                    ))}
                                </div>
                            ) : filteredItems.length > 0 ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                                    {filteredItems.map(item => (
                                        <MarketplaceItemCard
                                            key={item.id}
                                            item={item}
                                            onToggleFavorite={toggleFavorite}
                                            getFullImageUrl={getFullImageUrl}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyStateCard
                                    title='No items found'
                                    description='There are currently no items in the marketplace matching your criteria.'
                                    actionText='Clear Filters'
                                    onAction={handleClearFilters}
                                    icon={<FaShoppingBasket className='text-orange-500 text-5xl' />}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    )
}