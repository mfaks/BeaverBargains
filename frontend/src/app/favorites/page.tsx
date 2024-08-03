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
import { FaHeart } from 'react-icons/fa'
import { Item } from '@/types/Item'

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
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    if (!isAuthenticated) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
    }

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

            setItems(favoritedItems)
            setFilteredItems(favoritedItems)
            setFavorites(favoritesResponse.data)

            if (favoritedItems.length > 0) {
                const prices = favoritedItems.map(item => item.price)
                setMinPrice(Math.min(...prices))
                setMaxPrice(Math.max(...prices))
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

                setItems(items.map(item =>
                    item.id === itemId ? { ...item, isFavorited: newFavoritedStatus } : item
                ))
                setFilteredItems(filteredItems.map(item =>
                    item.id === itemId ? { ...item, isFavorited: newFavoritedStatus } : item
                ))

                toast({
                    title: "Success",
                    description: `Item ${newFavoritedStatus ? 'added to' : 'removed from'} favorites.`,
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

    const handlePriceFilter = (minPrice: number, maxPrice: number) => {
        const filtered = items.filter(item => item.price >= minPrice && item.price <= maxPrice)
        setFilteredItems(filtered)
    }

    const handleCategoryFilter = (categories: string[]) => {
        if (categories.length === 0) {
            setFilteredItems(items)
        } else {
            const filtered = items.filter(item =>
                categories.some(category =>
                    item.title.toLowerCase().includes(category.toLowerCase()) ||
                    item.description.toLowerCase().includes(category.toLowerCase())
                )
            )
            setFilteredItems(filtered)
        }
    }

    const handleSearch = (term: string) => {
        setSearchTerm(term)
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
        <div className="flex flex-col min-h-[100dvh] bg-orange-50 text-[#black]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-12 flex">
                {loading ? (
                    <div className="w-full">
                        <div className="flex justify-center mb-6">
                            <h1 className="text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1">
                                Your Current Favorites
                            </h1>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <>
                        <div className="w-1/4 pr-6">
                            <FilterSidebar
                                sortOptions={[
                                    { label: 'Price: Low to High', value: 'price_asc' },
                                    { label: 'Price: High to Low', value: 'price_desc' },
                                    { label: 'Newest First', value: 'date_desc' }
                                ]}
                                priceFilter={true}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onSort={handleSort}
                                onPriceFilter={handlePriceFilter}
                                onCustomFilter={(filterName, values) => {
                                    if (filterName === 'keywords') {
                                        handleCategoryFilter(values)
                                    }
                                }}
                                onSearch={handleSearch}
                            />
                        </div>
                        <div className="w-3/4">
                            <div className="flex justify-center mb-6">
                                <h1 className="text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1">
                                    Your Current Favorites
                                </h1>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredItems.map(item => (
                                    <FavoriteItemCard
                                        key={item.id}
                                        item={item}
                                        onToggleFavorite={toggleFavorite}
                                        getFullImageUrl={getFullImageUrl}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full">
                        <EmptyStateCard
                            title="No favorites yet"
                            description="You haven't added any items to your favorites. Browse the marketplace to add some!"
                            actionText="Browse Marketplace"
                            onAction={() => router.push('/marketplace')}
                            icon={<FaHeart className="text-orange-500" />}
                        />
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}