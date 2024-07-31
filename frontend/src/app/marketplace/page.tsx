"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../NavBar'
import Footer from '../Footer'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { useAuth } from '../AuthContext'
import UnauthorizedModal from '../UnauthorizedModal'
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Item } from '@/types/Item'
import Star from '@/components/ui/star'

export default function Marketplace() {
    const [items, setItems] = useState<Item[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const BASE_URL = 'http://localhost:8080'

    const getFullImageUrl = (imageUrl: string) => {
        if (imageUrl.startsWith('http')) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage("You must be logged in to access the marketplace. Redirecting to login.")
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            fetchItems();
            fetchFavorites();
        }
    }, [isAuthenticated, router]);

    const fetchItems = async () => {
        try {
            const response = await axios.get<Item[]>('http://localhost:8080/api/items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data)
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast({
                title: "Error",
                description: "Failed to fetch items. Please try again.",
                variant: "destructive",
                duration: 5000,
            })
        }
    };

    const fetchFavorites = async () => {
        try {
            const response = await axios.get<number[]>('http://localhost:8080/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFavorites(response.data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const toggleFavorite = async (itemId: number) => {
        try {
            if (favorites.includes(itemId)) {
                await axios.delete(`http://localhost:8080/api/favorites/${itemId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFavorites(favorites.filter(id => id !== itemId));
            } else {
                await axios.post('http://localhost:8080/api/favorites', { itemId }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFavorites([...favorites, itemId]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast({
                title: "Error",
                description: "Failed to update favorite. Please try again.",
                variant: "destructive",
                duration: 5000,
            })
        }
    };

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
        <div className="flex flex-col min-h-[100dvh] bg-[white] text-[#black]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
                <div className="flex justify-center mb-6">
                    <h1 className="text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1">
                        Welcome to the Marketplace
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map(item => (
                        <Card key={item.id} className="bg-white shadow rounded-lg relative">
                            <div className="absolute top-2 right-2 z-10">
                                <Star
                                    filled={favorites.includes(item.id)}
                                    onClick={() => toggleFavorite(item.id)}
                                />
                            </div>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>
                                    ${item.price.toFixed(2)} - Sold by {item.seller.firstName} {item.seller.lastName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src={getFullImageUrl(item.imageUrl)} alt={item.title} className="w-full h-auto rounded-lg mb-4" />
                            </CardContent>
                            <CardContent>
                                <p>Listed: {new Date(item.listingDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="bg-orange-500 text-white rounded-md px-4 py-2">View Details</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <p>{item.description}</p>
                                    </PopoverContent>
                                </Popover>
                                <Button className="bg-orange-500 text-white rounded-md px-4 py-2 ml-2">Message Seller</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}