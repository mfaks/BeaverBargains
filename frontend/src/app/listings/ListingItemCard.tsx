"use client"

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import FileInput from '@/components/ui/FileInput'
import { Card } from '@/components/ui/card'
import { Trash2Icon } from 'lucide-react'
import { Item } from '@/types/Item'
import { ListingItemCardProps } from '@/types/ListingItemCard'

const ListingItemCard: React.FC<ListingItemCardProps> = ({ item, getFullImageUrl, isSelected, onToggleSelect, token, onItemUpdate }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editedItem, setEditedItem] = useState<Item>(item)
    const [priceInput, setPriceInput] = useState(item.price.toFixed(2))
    const [newImage, setNewImage] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleDoubleClick = () => {
        setIsEditModalOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setEditedItem(prev => ({ ...prev, [name]: value }))
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
            setPriceInput(value)
        }
    }

    const handlePriceBlur = () => {
        if (priceInput !== '' && !isNaN(parseFloat(priceInput))) {
            const numericPrice = parseFloat(parseFloat(priceInput).toFixed(2))
            setEditedItem(prev => ({ ...prev, price: numericPrice }))
            setPriceInput(numericPrice.toFixed(2))
        } else if (priceInput === '') {
            setEditedItem(prev => ({ ...prev, price: 0 }))
            setPriceInput('0.00')
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewImage(file)
            setImagePreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleRemoveImage = () => {
        setNewImage(null)
        setImagePreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSave = async () => {
        try {
            const formData = new FormData()

            formData.append('item', new Blob([JSON.stringify({
                title: editedItem.title,
                description: editedItem.description,
                price: editedItem.price
            })], {
                type: 'application/json'
            }))

            if (newImage) {
                formData.append('image', newImage)
            }

            const response = await axios.put(`http://localhost:8080/api/items/${item.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })
            onItemUpdate(response.data)
            setIsEditModalOpen(false)
            toast({
                title: 'Success',
                description: 'Item updated successfully.',
                duration: 3000,
            })
        } catch (error) {
            console.error('Error updating item:', error)
            toast({
                title: 'Error',
                description: 'Failed to update item. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
    }

    return (
        <div>
<Card className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg" onDoubleClick={handleDoubleClick}>
                <div className="relative h-56">
                    <img 
                        src={getFullImageUrl(item.imageUrl)} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={onToggleSelect}
                        />
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100 h-[calc(100%-14rem)]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{item.title}</h3>
                        <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                            <Image 
                                src='/icons/calendar-icon.svg'
                                alt='Calendar'
                                width={12}
                                height={12}
                            />
                            <span>{new Date(item.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-full transition-colors flex items-center justify-center text-sm">
                        Edit Listing
                    </Button>
                </div>
            </Card>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Listing</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='title' className='text-right'>Title</label>
                            <Input
                                id='title'
                                name='title'
                                value={editedItem.title}
                                onChange={handleInputChange}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='price' className='text-right'>Price</label>
                            <Input
                                id='price'
                                name='price'
                                type='text'
                                value={priceInput}
                                onChange={handlePriceChange}
                                onBlur={handlePriceBlur}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='description' className='text-right'>Description</label>
                            <Textarea
                                id='description'
                                name='description'
                                value={editedItem.description}
                                onChange={handleInputChange}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='image' className='text-right'>Image</label>
                            <div className='col-span-3'>
                                <FileInput
                                    id='image'
                                    accept='image/*'
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                />
                                {(imagePreviewUrl || item.imageUrl) && (
                                    <div className='mt-4 relative group'>
                                        <img
                                            src={imagePreviewUrl || getFullImageUrl(item.imageUrl)}
                                            alt='Preview'
                                            className='max-w-xs h-auto rounded-md'
                                        />
                                        <div
                                            className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-md'
                                            onClick={handleRemoveImage}
                                        >
                                            <Trash2Icon className='h-16 w-16 text-white' />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type='submit' onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ListingItemCard