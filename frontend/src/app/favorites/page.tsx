"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from "next/navigation"
import { useAuth } from '../auth/AuthContext'
import FilterSidebar from '../FilterSidebar'
import FavoriteItemCard from './FavoriteItemCard'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'
import EmptyStateCard from '@/components/ui/EmptyStateCard'
import { useToast } from "@/components/ui/use-toast"
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FaHeart, FaShoppingBasket } from 'react-icons/fa'
import { Item } from '@/types/Item'
import BeaverIcon from '@/components/ui/BeaverIcon'

export default function Favorites() {
    const [items, setItems] = useState<Item[]>([])
    const [filteredItems, setFilteredItems] = useState<Item[]>([])
    const [favorites, setFavorites] = useState<number[]>([])
    const [errorMessage, setErrorMessage] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(Infinity)
    const [originalMinPrice, setOriginalMinPrice] = useState<number>(0)
    const [originalMaxPrice, setOriginalMaxPrice] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [descriptionSearch, setDescriptionSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage("You must be logged in to access your favorites. Redirecting to login.")
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            fetchItems()
        }
    }, [isAuthenticated, router])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const favoritesResponse = await axios.get<number[]>('http://localhost:8080/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const itemsResponse = await axios.get<Item[]>('http://localhost:8080/api/items', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const favoritedItems = itemsResponse.data.filter(item =>
                favoritesResponse.data.includes(item.id)
            ).map(item => ({
                ...item,
                isFavorited: true
            }))

            const tags = new Set(favoritedItems.flatMap(item => item.tags || []))
            setAllTags(Array.from(tags))

            setItems(favoritedItems)
            setFilteredItems(favoritedItems)
            setFavorites(favoritesResponse.data)

            if (favoritedItems.length > 0) {
                const prices = favoritedItems.map(item => item.price)
                const minItemPrice = Math.min(...prices)
                const maxItemPrice = Math.max(...prices)
                setMinPrice(minItemPrice)
                setMaxPrice(maxItemPrice)
                setOriginalMinPrice(minItemPrice)
                setOriginalMaxPrice(maxItemPrice)
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast({
                title: "Error",
                description: "Failed to fetch favorited items. Please try again.",
                variant: "destructive",
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDescriptionSearch = (term: string) => {
        setDescriptionSearch(term)
        applyFilters(term, selectedTags, minPrice, maxPrice)
    }

    const handleTagSearch = (term: string) => {
        setTagSearch(term)
    }

    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        applyFilters(descriptionSearch, tags, minPrice, maxPrice)
    }

    const toggleFavorite = async (itemId: number) => {
        try {
            const itemToUpdate = items.find(item => item.id === itemId)
            if (itemToUpdate) {
                const newFavoritedStatus = !itemToUpdate.isFavorited

                if (newFavoritedStatus) {
                    await axios.post(`http://localhost:8080/api/favorites`, { itemId }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                } else {
                    await axios.delete(`http://localhost:8080/api/favorites/${itemId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                }

                setItems(items.filter(item => item.id !== itemId))
                setFilteredItems(filteredItems.filter(item => item.id !== itemId))

                toast({
                    title: "Success",
                    description: `Item removed from favorites.`,
                    duration: 3000,
                })
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            toast({
                title: "Error",
                description: "Failed to update favorites. Please try again.",
                variant: "destructive",
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

    const handlePriceFilter = (min: number, max: number) => {
        setMinPrice(min)
        setMaxPrice(max)
        applyFilters(descriptionSearch, selectedTags, min, max)
    }

    const applyFilters = (descSearch: string, tags: string[], min: number, max: number) => {
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

    const BASE_URL = `http://localhost:8080`
    const getFullImageUrl = (imageUrl: string): string => {
        if (imageUrl.startsWith('http')) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    const [resetTrigger, setResetTrigger] = useState(0)

    const handleClearFilters = () => {
        setDescriptionSearch('')
        setTagSearch('')
        setSelectedTags([])
        setMinPrice(originalMinPrice)
        setMaxPrice(originalMaxPrice)
        setResetTrigger(prev => prev + 1)
        setFilteredItems(items)
    }

    return (
        <div className='flex flex-col min-h-screen bg-orange-50 text-orange-500'>
            <Navbar />
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
                        <h1 className='text-2xl font-bold text-center text-orange-700'> Your Favorite Items </h1>
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
                            ) : items.length > 0 ? (
                                filteredItems.length > 0 ? (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                                        {filteredItems.map(item => (
                                            <FavoriteItemCard
                                                key={item.id}
                                                item={item}
                                                onToggleFavorite={toggleFavorite}
                                                getFullImageUrl={getFullImageUrl}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCard
                                        title='No favorites found'
                                        description='There are currently no favorited items matching your criteria.'
                                        actionText='Clear Filters'
                                        onAction={handleClearFilters}
                                        icon={<FaHeart className='text-orange-500 text-5xl' />}
                                    />
                                )
                            ) : (
                                <EmptyStateCard
                                    title='No favorites yet'
                                    description="You haven't added any items to your favorites. Browse the marketplace to find items you like!"
                                    actionText='Go to Marketplace'
                                    onAction={() => router.push('/marketplace')}
                                    icon={<FaShoppingBasket className='text-orange-500 text-5xl' />}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        </div>
    )
}