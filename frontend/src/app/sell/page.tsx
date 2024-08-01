"use client"

import React, { useEffect, useState, useRef } from 'react'
import Navbar from '../NavBar'
import Footer from '../Footer'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '../AuthContext'
import UnauthorizedModal from '../UnauthorizedModal'
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
        )
        .transform((value) => parseFloat(parseFloat(value).toFixed(2))),
    image: z.instanceof(File).refine((file) => file instanceof File, { message: 'Image is required' }),
})

export default function Sell() {
    const [imageVisible, setImageVisible] = useState(false)
    const { isAuthenticated, token } = useAuth()
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const { toast } = useToast()
    const [isFormValid, setIsFormValid] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            setErrorMessage('You must be logged in to access the sell page. Redirecting to login.')
            setModalOpen(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        }
    }, [isAuthenticated])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '0.00',
            image: undefined,
        },
    })

    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            const { title, description, price, image } = value;
            const isValid = !!(title && description && price && image);
            setIsFormValid(isValid);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    type SubmitData = {
        title: string
        description: string
        price: string
        image?: File
    }

    const onSubmit: SubmitHandler<SubmitData> = async (values) => {
        try {
            const formData = new FormData()

            const item = {
                title: values.title,
                description: values.description,
                price: values.price
            }

            formData.append('item', new Blob([JSON.stringify(item)], {
                type: 'application/json'
            }))

            if (values.image) {
                formData.append('image', values.image)
            }

            const response = await axios.post('http://localhost:8080/api/items', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                form.reset({
                    title: '',
                    description: '',
                    price: '0.00',
                    image: undefined,
                })
                setImageVisible(false)
                setIsFormValid(false)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
                toast({
                    title: 'Success',
                    description: 'Your item has been successfully listed!',
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error('Error creating item: ', error)
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data)
            }
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
                                name='image'
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Upload Image</FormLabel>
                                        <FormControl>
                                            <FileInput
                                                id='item-image-upload'
                                                accept='image/*'
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    onChange(file)
                                                    setImageVisible(!!file)
                                                }}
                                                {...field}
                                                className='p-2 border rounded-md w-full'
                                                ref={fileInputRef}
                                            />
                                        </FormControl>
                                        {value && imageVisible ? (
                                            <div className='mt-4 flex justify-center'>
                                                <div className='relative group'>
                                                    <img
                                                        src={URL.createObjectURL(value)}
                                                        alt='Preview'
                                                        className='max-w-xs h-auto rounded-md'
                                                    />
                                                    <div
                                                        className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-md'
                                                        onClick={() => {
                                                            onChange(null)
                                                            setImageVisible(false)
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = ''
                                                            }
                                                        }}
                                                    >
                                                        <Trash2Icon className='h-16 w-16 text-white' />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <FormDescription></FormDescription>
                                        )}
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