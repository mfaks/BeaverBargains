import React from 'react'
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

// dummy data
const items = [
    {
        id: 1,
        title: "Used Textbook",
        description: "A gently used textbook for your courses.",
        price: "$25",
        imageUrl: "https://placekitten.com/200/300",
        sellerName: "Mary",
        listingDate: "2/2/2024",
    },
    {
        id: 2,
        title: "Bicycle",
        description: "A mountain bike in excellent condition.",
        price: "$150",
        imageUrl: "https://placekitten.com/200/300",
        sellerName: "John",
        listingDate: "3/4/2024"
    },
    {
        id: 3,
        title: "Laptop",
        description: "A MacBook Air, lightly used.",
        price: "$500",
        imageUrl: "https://placekitten.com/200/300",
        sellerName: "Alice",
        listingDate: "5/5/2024"
    },
    {
        id: 4,
        title: "Game Console",
        description: "PlayStation 4 with controllers and games.",
        price: "$200",
        imageUrl: "https://placekitten.com/200/300",
        sellerName: "Bob",
        listingDate: "9/4/2024"
    },
]

export default function Buy() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-[white] text-[#black]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
                <h1 className="text-3xl font-bold text-orange-500 mb-6">Items for Sale</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map(item => (
                        <Card key={item.id} className="bg-white shadow rounded-lg">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.price} - Sold by {item.sellerName}</CardDescription>
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
                                        <p>Listing Date: {item.listingDate}</p>
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