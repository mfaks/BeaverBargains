"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import FilterSidebar from '../FilterSidebar'
import ListingItemCard from './ListingItemCard'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'
import { useToast } from '@/components/ui/use-toast'
import EmptyStateCard from '@/components/ui/EmptyStateCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FaClipboardList } from 'react-icons/fa'
import { Item } from '@/types/Item'

export default function Listings() {
    const [items, setItems] = useState<Item[]>([])
    const [filteredItems, setFilteredItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(Infinity)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    if (!isAuthenticated || !token) {
        return (
            <UnauthorizedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={errorMessage}
            />
        )
    }

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
            const response = await axios.get<Item[]>(`http://localhost:8080/api/items/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const sortedItems = response.data.sort((a, b) =>
                new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
            )

            setItems(sortedItems)
            setFilteredItems(sortedItems)

            if (sortedItems.length > 0) {
                const prices = sortedItems.map(item => item.price)
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

    const handleItemUpdate = (updatedItem: Item) => {
        const updatedItems = items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        )
        setItems(updatedItems)
        setFilteredItems(updatedItems)
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

    const toggleSelectItem = (itemId: number) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
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
        <div className='flex flex-col min-h-[100dvh] bg-orange-50 text-[#black]'>
            <Navbar />
            <div className='flex flex-1'>
                {!loading && filteredItems.length > 0 && (
                    <aside className='w-64 bg-white shadow-md flex-shrink-0'>
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
                    </aside>
                )}
                <main className={`flex-1 px-4 md:px-6 py-12 flex justify-center ${!loading && filteredItems.length === 0 ? 'w-full' : ''}`}>
                    <div className={`${!loading && filteredItems.length > 0 ? 'w-[1024px]' : 'w-full'}`}>
                        <div className='flex justify-center mb-6'>
                            <h1 className='text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1'>
                                Your Active Listings
                            </h1>
                        </div>
                        {loading ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                                {[...Array(6)].map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                                {filteredItems.map(item => (
                                    <ListingItemCard
                                        key={item.id}
                                        item={item}
                                        getFullImageUrl={getFullImageUrl}
                                        isSelected={selectedItems.includes(item.id)}
                                        onToggleSelect={() => toggleSelectItem(item.id)}
                                        token={token}
                                        onItemUpdate={handleItemUpdate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyStateCard
                                title='No listings yet'
                                description='You haven not listed any items yet. Start selling to see your listings here!'
                                actionText='Create Listing'
                                onAction={() => router.push('/sell')}
                                icon={<FaClipboardList className='text-orange-500' />}
                            />
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}