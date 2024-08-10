"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import NavBar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FilterSidebar from '../FilterSidebar'
import Image from 'next/image'

interface OrderItem {
    id: number
    title: string
    price: number
    seller: {
        firstName: string
        lastName: string
    }
    purchaseDate: string
    imageUrl: string
}

export default function Orders() {
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([])
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(Infinity)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get<OrderItem[]>('http://localhost:8080/api/items/user/purchased', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })

                console.log(response.data)
                setOrders(response.data)
                setFilteredOrders(response.data)

                if (response.data.length > 0) {
                    const prices = response.data.map(item => item.price)
                    setMinPrice(Math.min(...prices))
                    setMaxPrice(Math.max(...prices))
                }
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
        const filtered = orders.filter(order => order.price >= min && order.price <= max)
        setFilteredOrders(filtered)
    }

    const handleDateFilter = (startDate: Date, endDate: Date) => {
        const filtered = orders.filter(order => {
            const purchaseDate = new Date(order.purchaseDate)
            return purchaseDate >= startDate && purchaseDate <= endDate
        })
        setFilteredOrders(filtered)
    }

    const handleSearch = (term: string) => {
        const filtered = orders.filter(order =>
            order.title.toLowerCase().includes(term.toLowerCase()) ||
            order.seller.firstName.toLowerCase().includes(term.toLowerCase()) ||
            order.seller.lastName.toLowerCase().includes(term.toLowerCase())
        )
        setFilteredOrders(filtered)
    }

    const getFullImageUrl = (imageUrl: string) => {
        const BASE_URL = 'http://localhost:8080'
        return `${BASE_URL}/uploads/${imageUrl}`
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
                            { label: 'Most Recent', value: 'date_desc' },
                            { label: 'Oldest', value: 'date_asc' }
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
                <main className='flex-1 container mx-auto px-4 md:px-6 py-12 overflow-y-auto'>
                    <div className='flex justify-center mb-6'>
                        <h1 className='text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1'>
                            My Purchase History
                        </h1>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Purchased Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredOrders.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {filteredOrders.map((order) => (
                                        <Card key={order.id} className="overflow-hidden">
                                            <div className="relative h-48">
                                                <Image
                                                    src={getFullImageUrl(order.imageUrl)}
                                                    alt={order.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-lg mb-2">{order.title}</h3>
                                                <p className="text-sm text-gray-600 mb-1">Price: ${order.price.toFixed(2)}</p>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Seller: {order.seller.firstName} {order.seller.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Purchased: {new Date(order.purchaseDate).toLocaleDateString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">You haven't purchased any items yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
            <Footer />
        </div>
    )
}