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

export default function Marketplace() {
    const [items, setItems] = useState<Item[]>([]);
    const [errorMessage, setErrorMessage] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage("You must be logged in to access the marketplace. Redirecting to login.")
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            fetchItems();
        }
    }, [isAuthenticated, router]);

    const fetchItems = async () => {
        try {
            const response = await axios.get<Item[]>('http://localhost:8080/api/items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
                        <Card key={item.id} className="bg-white shadow rounded-lg">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>
                                    ${item.price.toFixed(2)} - Sold by {item.seller.firstName} {item.seller.lastName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src={item.imageUrl} alt={item.title} className="w-full h-auto rounded-lg mb-4" />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="bg-orange-500 text-white rounded-md px-4 py-2">View Details</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <p>{item.description}</p>
                                        <p>Listing Date: {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </PopoverContent>
                                </Popover>
                                <Button className="bg-orange-500 text-white rounded-md px-4 py-2 ml-2">Add to Cart</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}