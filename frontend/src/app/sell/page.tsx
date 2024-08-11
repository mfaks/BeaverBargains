"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthContext'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'
import { Trash2Icon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import FileInput from '@/components/ui/FileInput'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.string()
        .refine(
            (value) => {
                const regex = /^\d+(\.\d{0,2})?$/
                return regex.test(value) && parseFloat(value) >= 0
            },
            {
                message: 'Price must be a valid number with up to 2 decimal places and at least 0.00',
            }
        ),
    images: z.array(z.instanceof(File)).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
    tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
})

type FormValues = z.infer<typeof formSchema>;

export default function Sell() {
    const [images, setImages] = useState<File[]>([])
    const [tags, setTags] = useState<string[]>([])
    const { isAuthenticated, token } = useAuth()
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const { toast } = useToast()
    const [isFormValid, setIsFormValid] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const [suggestedTags] = useState(['Free', 'Electronics', 'Furniture', 'Kitchen', 'Books', 'Clothing', 'Sports', 'Toys'])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '0.00',
            images: [],
            tags: [],
        },
    })

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to access the sell page. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push(`/login`)
            }, 2000)
        }
    }, [isAuthenticated, router])

    useEffect(() => {
        const subscription = form.watch((value) => {
            const { title, description, price, images, tags } = value;
            const isValid = !!(title && description && price && images && images.length > 0);
            setIsFormValid(isValid);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length + images.length > 5) {
            toast({
                title: 'Error',
                description: 'Maximum 5 images allowed',
                variant: 'destructive',
                duration: 5000,
            })
            return
        }
        const newImages = [...images, ...files]
        setImages(newImages)
        form.setValue('images', newImages)
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages)
        form.setValue('images', newImages)
    }

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag) && tags.length < 5) {
            const newTags = [...tags, tag]
            setTags(newTags)
            form.setValue('tags', newTags)
        }
    }

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const value = e.currentTarget.value.trim()
            addTag(value)
            e.currentTarget.value = ''
        }
    }

    const removeTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index)
        setTags(newTags)
        form.setValue('tags', newTags)
    }

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            const formData = new FormData()

            const item = {
                title: values.title,
                description: values.description,
                price: parseFloat(values.price),
                tags: values.tags
            }

            formData.append('item', new Blob([JSON.stringify(item)], {
                type: 'application/json'
            }))

            values.images.forEach((image, index) => {
                formData.append(`images`, image)
            })

            const response = await axios.post(`http://localhost:8080/api/items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                form.reset()
                setImages([])
                setTags([])
                toast({
                    title: 'Success',
                    description: 'Your item has been successfully listed!',
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error('Error creating item: ', error)
            toast({
                title: 'Error',
                description: 'Failed to list item. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
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
        <div className='min-h-screen bg-orange-50'>
            <Navbar />
            <div className='container mx-auto px-4 py-8 max-w-2xl'>
                <div className='flex justify-center mb-6'>
                    <h1 className='text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1'>
                        List an Item for Sale
                    </h1>
                </div>
                <div className='bg-white shadow-md rounded-lg p-8'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Item Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Enter item title' {...field} className='p-2 border rounded-md' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Enter item description' {...field} className='p-2 border rounded-md' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='price'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Price ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='text'
                                                placeholder='0.00'
                                                {...field}
                                                className='p-2 border rounded-md'
                                                onFocus={(e) => {
                                                    if (field.value === '0.00') {
                                                        e.target.value = ''
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
                                                        field.onChange('0.00')
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='images'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Upload Images (Max 5)</FormLabel>
                                        <FormControl>
                                            <FileInput
                                                id='item-image-upload'
                                                accept='image/*'
                                                multiple
                                                onChange={handleImageUpload}
                                                className='p-2 border rounded-md w-full'
                                                ref={fileInputRef}
                                            />
                                        </FormControl>
                                        <div className='mt-4 flex flex-wrap gap-4'>
                                            {images.map((image, index) => (
                                                <div key={index} className='relative group'>
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Preview ${index + 1}`}
                                                        className='w-24 h-24 object-cover rounded-md'
                                                    />
                                                    <div
                                                        className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-md'
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <Trash2Icon className='h-6 w-6 text-white' />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='tags'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Tags (Max 5)</FormLabel>
                                        <FormControl>
                                            <div>
                                                <Input
                                                    type='text'
                                                    placeholder='Enter tags (press Enter or comma to add)'
                                                    onKeyDown={handleTagInput}
                                                    className='p-2 border rounded-md'
                                                />
                                                <div className='mt-2 flex flex-wrap gap-2'>
                                                    {suggestedTags.map((tag, index) => (
                                                        <Button
                                                            key={index}
                                                            type='button'
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => addTag(tag)}
                                                            disabled={tags.includes(tag) || tags.length >= 5}
                                                            className='text-sm'
                                                        >
                                                            {tag}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <div className='mt-2 flex flex-wrap gap-2'>
                                                    {tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className='bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center'
                                                        >
                                                            {tag}
                                                            <button
                                                                type='button'
                                                                onClick={() => removeTag(index)}
                                                                className='ml-1 text-orange-600 hover:text-orange-800'
                                                            >
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type='submit'
                                variant='outline'
                                className={`w-full font-bold py-2 px-4 rounded-md transition-all duration-200 ${isFormValid
                                    ? 'bg-orange-500 text-white'
                                    : 'text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                                    }`}
                                disabled={!isFormValid}
                            >
                                List Item
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
            <Footer />
        </div>
    )
}