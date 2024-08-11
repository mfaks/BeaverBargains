"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from "next/navigation"
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

export default function Marketplace({ searchQuery }: { searchQuery: string }) {
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
    const [loading, setLoading] = useState(true)
    const [descriptionSearch, setDescriptionSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage("You must be logged in to access the marketplace. Redirecting to login.")
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            fetchItems(searchQuery)
            fetchFavorites()
            fetchAllTags()
        }
    }, [isAuthenticated, router, searchQuery])

    const fetchItems = async (query = '', tags = selectedTags, descSearch = descriptionSearch, tgSearch = tagSearch) => {
        setLoading(true)
        try {
            let url = 'http://localhost:8080/api/items/search'
            const params = new URLSearchParams()
            if (query) params.append('query', query)
            if (descSearch) params.append('descriptionSearch', descSearch)
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
 
            setItems(items)
            setFilteredItems(items)

            if (items.length > 0) {
                const prices = items.map(item => item.price)
                setMinPrice(Math.min(...prices))
                setMaxPrice(Math.max(...prices))
            }

            setLoading(false)

            if ((query || tags.length > 0 || descSearch || tgSearch) && items.length === 0) {
                toast({
                    title: "No Results",
                    description: `No items matching your criteria were found.`,
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast({
                title: "Error",
                description: "Failed to fetch items. Please login to your account or refresh the page.",
                variant: "destructive",
                duration: 5000,
            })
            setLoading(false)
        }
    }

    const fetchAllTags = async () => {
        try {
            const response = await axios.get<string[]>('http://localhost:8080/api/items/tags', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setAllTags(response.data)
        } catch (error) {
            console.error('Error fetching tags:', error)
        }
    }


    const handleDescriptionSearch = (term: string) => {
        setDescriptionSearch(term)
        fetchItems(searchQuery, selectedTags, term, tagSearch)
    }

    const handleTagSearch = (term: string) => {
        setTagSearch(term)
        fetchItems(searchQuery, selectedTags, descriptionSearch, term)
    }


    const handleTagFilter = (tags: string[]) => {
        setSelectedTags(tags)
        const filtered = items.filter(item =>
            tags.length === 0 || tags.every(tag => item.tags.includes(tag))
        )
        setFilteredItems(filtered)
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

            setItems(updateItems)
            setFilteredItems(updateItems)
        } catch (error) {
            console.error('Error toggling favorite:', error)
            toast({
                title: "Error",
                description: "Failed to update favorite. Please try again.",
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

    const handlePriceFilter = (minPrice: number, maxPrice: number) => {
        const filtered = items.filter(item => item.price >= minPrice && item.price <= maxPrice)
        setFilteredItems(filtered)
    }

    const BASE_URL = `http://localhost:8080`
    const getFullImageUrl = (imageUrls: string | string[]): string[] => {
        if (Array.isArray(imageUrls)) {
            return imageUrls.map(url => {
                if (url.startsWith('http')) {
                    return url
                }
                return `${BASE_URL}/uploads/${url}`
            })
        }
        return [imageUrls.startsWith('http') ? imageUrls : `${BASE_URL}/uploads/${imageUrls}`]
    }

    if (!isAuthenticated) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
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
                )}
                <main className="flex-1 overflow-y-auto pl-0 pr-6 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-6">
                            <h1 className="text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1">
                                {searchQuery ? `Search Results for "${searchQuery}"` : 'Welcome to the Marketplace'}
                            </h1>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                                title="No items found"
                                description="There are currently no items in the marketplace matching your criteria."
                                actionText="Clear Filters"
                                onAction={() => {
                                    setDescriptionSearch('')
                                    setTagSearch('')
                                    setSelectedTags([])
                                    fetchItems('', [], '', '')
                                }}
                                icon={<FaShoppingBasket className="text-orange-500" />}
                            />
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}