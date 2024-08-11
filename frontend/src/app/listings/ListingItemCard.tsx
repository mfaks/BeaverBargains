"use client"

import React, { useState, useRef, useEffect } from 'react'
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
import { Trash2Icon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Item } from '@/types/Item'
import { ListingItemCardProps } from '@/types/ListingItemCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ListingItemCard: React.FC<ListingItemCardProps> = ({ item, getFullImageUrl, isSelected, onToggleSelect, token, onItemUpdate, onMarkAsSold, isSold }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false)
    const [editedItem, setEditedItem] = useState<Item>(item)
    const [priceInput, setPriceInput] = useState(item.price.toFixed(2))
    const [newImages, setNewImages] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(item.imageUrls)
    const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
    const [buyers, setBuyers] = useState<{ id: number; firstName: string; lastName: string; email: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [newTag, setNewTag] = useState('')

    useEffect(() => {
        setEditedItem(item)
        setImagePreviewUrls(item.imageUrls)
        setPriceInput(item.price.toFixed(2))
    }, [item])

    useEffect(() => {
        if (isMarkAsSoldModalOpen) {
            fetchBuyers()
        }
    }, [isMarkAsSoldModalOpen])

    const fetchBuyers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/messages/conversation-users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const filteredBuyers = response.data.filter((user: any) => user.id !== item.seller.id)
            setBuyers(filteredBuyers)
        } catch (error) {
            console.error('Error fetching potential buyers:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch potential buyers. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
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
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            setNewImages(prevImages => [...prevImages, ...files])
            const newPreviewUrls = files.map(file => URL.createObjectURL(file))
            setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls])
        }
    }

    const handleRemoveImage = (index: number) => {
        setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index))
        setNewImages(prevImages => prevImages.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        try {
            const formData = new FormData()

            formData.append('item', new Blob([JSON.stringify({
                title: editedItem.title,
                description: editedItem.description,
                price: editedItem.price,
                tags: editedItem.tags
            })], {
                type: 'application/json'
            }))

            newImages.forEach((image, index) => {
                formData.append(`images`, image)
            })

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

    const handleMarkAsSold = async () => {
        if (!selectedBuyerId) {
            toast({
                title: 'Error',
                description: 'Please select a buyer before marking the item as sold.',
                variant: 'destructive',
                duration: 5000,
            });
            return;
        }
        try {
            const currentDate = new Date().toISOString();
            await onMarkAsSold(item.id, parseInt(selectedBuyerId), currentDate);
            setIsMarkAsSoldModalOpen(false);
            toast({
                title: 'Success',
                description: 'Item marked as sold successfully.',
                duration: 3000,
            });
        } catch (error) {
            console.error('Error marking item as sold:', error);
            toast({
                title: 'Error',
                description: 'Failed to mark item as sold. Please try again.',
                variant: 'destructive',
                duration: 5000
            });
        }
    };

    const handleAddTag = () => {
        if (newTag && !editedItem.tags.includes(newTag)) {
            setEditedItem(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }))
            setNewTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setEditedItem(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleReactivate = async () => {
        try {
            const response = await axios.put(`http://localhost:8080/api/items/${item.id}/reactivate`, null, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            onItemUpdate(response.data)
            toast({
                title: 'Success',
                description: 'Item reactivated successfully.',
                duration: 3000,
            })
        } catch (error) {
            console.error('Error reactivating item:', error)
            toast({
                title: 'Error',
                description: 'Failed to reactivate item. Please try again.',
                variant: 'destructive',
                duration: 5000,
            })
        }
    }

    const handleDoubleClick = () => {
        if (!isSold) {
            setIsEditModalOpen(true)
        } else {
            toast({
                title: 'Cannot Edit Sold Item',
                description: 'You cannot edit sold items. Only active items on the marketplace can be edited.',
                variant: 'default',
                duration: 5000,
            })
        }
    }

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.imageUrls.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.imageUrls.length) % item.imageUrls.length)
    }

    const [fullImageUrls, setFullImageUrls] = useState<string[]>([])

    useEffect(() => {
        setCurrentImageIndex(0)
        setFullImageUrls(item.imageUrls.map(getFullImageUrl))
    }, [item.imageUrls, getFullImageUrl])


    return (
        <div>
            <Card className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg" onDoubleClick={handleDoubleClick}>
                <div className="relative h-56">
                    <img
                        src={fullImageUrls[currentImageIndex] || '/placeholder-image.jpg'}
                        alt={`${item.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                    {item.imageUrls.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-orange-500 hover:text-white rounded-full p-1"
                                onClick={nextImage}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    <div className="absolute top-2 right-2">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={onToggleSelect}
                        />
                    </div>
                    {isSold && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded">
                            Sold
                        </div>
                    )}
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
                    {!isSold ? (
                        <div className="flex gap-2">
                            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-full transition-colors flex items-center justify-center text-sm" onClick={() => setIsEditModalOpen(true)}>
                                Edit Listing
                            </Button>
                            <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-full transition-colors flex items-center justify-center text-sm" onClick={() => setIsMarkAsSoldModalOpen(true)}>
                                Mark as Sold
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-full transition-colors flex items-center justify-center text-sm" onClick={handleReactivate}>
                            Reactivate Listing
                        </Button>
                    )}
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
                            <label htmlFor='tags' className='text-right'>Tags</label>
                            <div className='col-span-3'>
                                <div className='flex flex-wrap gap-2 mb-2'>
                                    {editedItem.tags.map((tag, index) => (
                                        <span key={index} className='bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center'>
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className='ml-1 text-orange-600 hover:text-orange-800'>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className='flex gap-2'>
                                    <Input
                                        id='newTag'
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder='Add a new tag'
                                        className='flex-grow'
                                    />
                                    <Button onClick={handleAddTag} type='button'>Add Tag</Button>
                                </div>
                            </div>
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='image' className='text-right'>Images</label>
                            <div className='col-span-3'>
                                <FileInput
                                    id='image'
                                    accept='image/*'
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                    multiple
                                />
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {imagePreviewUrls.map((url, index) => (
                                        <div key={index} className='relative group'>
                                            <img
                                                src={fullImageUrls[0] || '/placeholder-image.jpg'}
                                                alt={`Preview ${index + 1}`}
                                                className='w-24 h-24 object-cover rounded-md'
                                            />
                                            <div
                                                className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-md'
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <Trash2Icon className='h-6 w-6 text-white' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type='submit' onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isMarkAsSoldModalOpen} onOpenChange={setIsMarkAsSoldModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Item as Sold</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='buyer' className='text-right'>Buyer</label>
                            <Select onValueChange={setSelectedBuyerId}>
                                <SelectTrigger className='col-span-3'>
                                    <SelectValue placeholder="Select a buyer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buyers.map(buyer => (
                                        <SelectItem key={buyer.id} value={buyer.id.toString()}>
                                            {buyer.firstName} {buyer.lastName} ({buyer.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleMarkAsSold} disabled={!selectedBuyerId}>Mark as Sold</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ListingItemCard