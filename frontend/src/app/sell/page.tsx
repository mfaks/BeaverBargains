"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import BeakerIcon from '@/components/ui/BeakerIcon'
import FileInput from "@/components/ui/FileInput"
import { Button } from "@/components/ui/button"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TrashIcon } from 'lucide-react'

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
    image: z.instanceof(File).optional(),
})

export default function Sell() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            price: "0.00",
            image: undefined,
        },
    })

    type SubmitData = {
        title: string
        description: string
        price: string
        image?: File
    }

    const onSubmit: SubmitHandler<SubmitData> = async (values) => {
        console.log(values)

        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('description', values.description)
        formData.append('price', values.price.toString())
        if (values.image) {
            formData.append('image', values.image)
        } else {
            console.log('No image selected')
        }

    }


    const [imageVisible, setImageVisible] = useState(true)

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#f0f0f0] text-[#1a1a1a]">
            <header className="px-4 lg:px-6 h-14 flex items-center bg-[#1a1a1a] text-[#f0f0f0]">
                <Link href="#" className="flex items-center justify-center" prefetch={false}>
                    <BeakerIcon />
                    <span className="text-2xl font-bold text-orange-500">BeaverBargains</span>
                </Link>
            </header>
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
                                                    <img src={URL.createObjectURL(value)} alt="Uploaded" className="h-12 w-12" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="ml-2"
                                                        onClick={() => {
                                                            onChange(null)
                                                            setImageVisible(false)
                                                            const fileInput = document.getElementById('item-image-upload') as HTMLInputElement
                                                            if (fileInput) {
                                                                fileInput.value = ''
                                                            }
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 italic">No file selected</span>
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
        </div>
    )
}