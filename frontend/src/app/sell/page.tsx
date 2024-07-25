"use client"

import React, { useEffect, useState } from 'react'
import Navbar from '../NavBar'
import Footer from '../Footer'
import FileInput from "@/components/ui/FileInput"
import { Button } from "@/components/ui/button"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TrashIcon } from 'lucide-react'
import { Tag, TagInput } from 'emblor'
import { useAuth } from '../AuthContext'
import UnauthorizedModal from '../UnauthorizedModal'

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string()
        .refine(
            (value) => {
                const regex = /^\d+(\.\d{0,2})?$/
                return regex.test(value) && parseFloat(value) >= 0
            },
            {
                message: "Price must be a valid number with up to 2 decimal places and at least 0.00",
            }
        )
        .transform((value) => parseFloat(parseFloat(value).toFixed(2))),
    tags: z.array(z.string()).optional(),
    image: z.instanceof(File).optional(),
})

export default function Sell() {
    const [imageVisible, setImageVisible] = useState(true)
    const { isAuthenticated } = useAuth()
    const [errorMessage, setErrorMessage] = useState("")
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage("You must be logged in to access the sell page. Navigating you back to home.")
            setModalOpen(true)
            setTimeout(() => {
                window.location.href = '/'
            }, 2000)
        }
    }, [isAuthenticated])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            price: "0.00",
            tags: [],
            image: undefined,
        },
    })

    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

    type SubmitData = {
        title: string
        description: string
        price: string
        tags?: string[]
        image?: File
    }

    const onSubmit: SubmitHandler<SubmitData> = async (values) => {
        console.log(values)

        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('description', values.description)
        formData.append('price', values.price.toString())
        if (values.tags) {
            formData.append('tags', JSON.stringify(values.tags))
        }
        if (values.image) {
            formData.append('image', values.image)
        } else {
            console.log('No image selected')
        }

        //will print confirmation (let user know they can input another value)/error message; clear form
        //send data to the market and associate it with the user
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f0f0f0] text-[#1a1a1a] items-center justify-center">
                <UnauthorizedModal isOpen={modalOpen} onClose={() => setModalOpen(false)} message={errorMessage} />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#f0f0f0] text-[#1a1a1a]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
                <h1 className="text-3xl font-bold text-orange-500 mb-6">Sell Your Items</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter item name" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter a descriptive title for your item.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter description" rows={4} {...field} />
                                    </FormControl>
                                    <FormDescription>Provide a detailed description of the item.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="0.00"
                                            type="text"
                                            value={field.value}
                                            onFocus={(e) => {
                                                if (field.value === "0.00") {
                                                    e.target.value = ""
                                                } else {
                                                    e.target.select()
                                                }
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (/^\d*(\.\d{0,2})?$/.test(value) || value === '') {
                                                    field.onChange(value)
                                                }
                                            }}
                                            onBlur={(e) => {
                                                let value = e.target.value
                                                if (value !== '' && !isNaN(parseFloat(value))) {
                                                    value = parseFloat(value).toFixed(2)
                                                    field.onChange(value)
                                                } else if (value === '') {
                                                    field.onChange("0.00")
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>Set the listing price for your item.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                        <TagInput
                                            placeholder="Add tags"
                                            tags={field.value}
                                            activeTagIndex={activeTagIndex}
                                            setActiveTagIndex={setActiveTagIndex}
                                            setTags={(newTags) => {
                                                field.onChange(newTags)
                                            }}
                                            className="border border-gray-300 rounded-md p-2"
                                            styleClasses={{
                                                tag: {
                                                    body: 'bg-orange-400 text-white rounded-full px-3 py-1 flex items-center justify-center',
                                                    closeButton: 'ml-2 text-white hover:text-gray-200',
                                                },
                                                input: 'w-full sm:max-w-[350px]',
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>Add tags to help others find your item.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem className="mb-4">
                                    <FormLabel>Upload an Image</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <FileInput
                                                id="item-image-upload"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    onChange(file)
                                                    setImageVisible(true)
                                                }}
                                                {...field}
                                            />
                                            {value && imageVisible ? (
                                                <div className="flex items-center">
                                                    <img src={URL.createObjectURL(value)} alt="Uploaded" className="h-16 w-16" />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="ml-2 bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center"
                                                        onClick={() => {
                                                            onChange(null)
                                                            setImageVisible(false)
                                                            const fileInput = document.getElementById('item-image-upload') as HTMLInputElement
                                                            if (fileInput) {
                                                                fileInput.value = ''
                                                            }
                                                        }}
                                                    >
                                                        <TrashIcon className="h-4 w-4 mr-1" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 italic"></span>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription className="mt-2">Upload an image of your item.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button className="bg-orange-500 text-white rounded-md px-4 py-2 hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
            <Footer />
        </div>
    )
}
