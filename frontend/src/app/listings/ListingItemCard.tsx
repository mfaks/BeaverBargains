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
import { Trash2Icon, ChevronLeft, ChevronRight, X, MoreVertical, Edit } from 'lucide-react'
import { Item } from '@/types/Item'
import { ListingItemCardProps } from '@/types/ListingItemCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'


const ListingItemCard: React.FC<ListingItemCardProps> = ({ item, getFullImageUrl, isSelected, onToggleSelect, token, onItemUpdate, onMarkAsSold, isSold }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false)
    const [editedItem, setEditedItem] = useState<Item>(item)
    const [priceInput, setPriceInput] = useState(item.price.toFixed(2))
    const [newImages, setNewImages] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<{ url: string; isNew: boolean }[]>(item.imageUrls.map(url => ({ url, isNew: false })))
    const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
    const [buyers, setBuyers] = useState<{ id: number; firstName: string; lastName: string; email: string; profileImageUrl: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [newTag, setNewTag] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [fullImageUrls, setFullImageUrls] = useState<string[]>([])
    const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
    const [isConfirmCloseDialogOpen, setIsConfirmCloseDialogOpen] = useState(false)
    const [isConfirmSaveDialogOpen, setIsConfirmSaveDialogOpen] = useState(false)

    const BASE_URL = 'http://localhost:8080'
    const getFullProfileImageUrl = (imageUrl: string | undefined): string => {
        if (!imageUrl) {
            return '/default-profile-image.jpg'
        }
        if (imageUrl.startsWith('http')) {
            return imageUrl
        }
        return `${BASE_URL}/uploads/${imageUrl}`
    }

    useEffect(() => {
        setEditedItem(item)
        setImagePreviewUrls(item.imageUrls.map(url => ({ url, isNew: false })))
        setPriceInput(item.price.toFixed(2))
    }, [item])

    useEffect(() => {
        if (isMarkAsSoldModalOpen) {
            fetchBuyers()
        }
    }, [isMarkAsSoldModalOpen])

    useEffect(() => {
        setCurrentImageIndex(0)
        setFullImageUrls(item.imageUrls.map(getFullImageUrl))
    }, [item.imageUrls, getFullImageUrl])

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
        setIsUnsavedChanges(true)
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
            setPriceInput(value)
            setIsUnsavedChanges(true)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const newTotalImages = imagePreviewUrls.length + files.length
            if (newTotalImages <= 5) {
                setNewImages(prevImages => [...prevImages, ...files])
                const newPreviewUrls = files.map(file => ({
                    url: URL.createObjectURL(file),
                    isNew: true
                }))
                setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls])
                setIsUnsavedChanges(true)
            } else {
                toast({
                    title: 'Maximum Images Reached',
                    description: 'You can only have a maximum of 5 images per listing.',
                    variant: 'destructive',
                    duration: 5000,
                })
            }
        }
    }

    const handleRemoveImage = (index: number) => {
        setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index))
        setNewImages(prevImages => prevImages.filter((_, i) => i !== index))
        setIsUnsavedChanges(true)
    }

    const handleSave = async () => {
        setIsConfirmSaveDialogOpen(true)
    }

    const confirmSave = async () => {
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

            newImages.forEach((image) => {
                formData.append('images', image)
            })

            const response = await axios.put(`http://localhost:8080/api/items/${item.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })
            onItemUpdate(response.data)
            setIsEditModalOpen(false)
            setIsUnsavedChanges(false)
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
        setIsConfirmSaveDialogOpen(false)
    }

    const handleAddTag = () => {
        if (newTag && !editedItem.tags.includes(newTag) && editedItem.tags.length < 5) {
            setEditedItem(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }))
            setNewTag('')
            setIsUnsavedChanges(true)
        } else if (editedItem.tags.length >= 5) {
            toast({
                title: 'Maximum Tags Reached',
                description: 'You can only have a maximum of 5 tags per listing.',
                variant: 'destructive',
                duration: 5000,
            })
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setEditedItem(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
        setIsUnsavedChanges(true)
    }

    const handleCloseEditModal = () => {
        if (isUnsavedChanges) {
            setIsConfirmCloseDialogOpen(true)
        } else {
            setIsEditModalOpen(false)
        }
    }

    const confirmClose = () => {
        setIsEditModalOpen(false)
        setIsUnsavedChanges(false)
        setIsConfirmCloseDialogOpen(false)
        setEditedItem(item)
        setImagePreviewUrls(item.imageUrls.map(url => ({ url, isNew: false })))
        setPriceInput(item.price.toFixed(2))
        setNewImages([])
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

    const handleMarkAsSold = () => {
        if (selectedBuyerId) {
            onMarkAsSold(item.id, parseInt(selectedBuyerId), new Date().toISOString())
            setIsMarkAsSoldModalOpen(false)
            toast({
                title: "Item Marked as Sold",
                description: "The item has been successfully marked as sold.",
                duration: 3000,
            })
        } else {
            toast({
                title: "Error",
                description: "Please select a buyer before marking the item as sold.",
                variant: "destructive",
                duration: 3000,
            })
        }
    }

    const handleEditClick = () => {
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

    return (
        <div>
            <Card
                className={`w-64 h-[380px] rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 
                            ${isSelected ? 'border-orange-500' : 'border-orange-300'}
                            ${isSold ? 'opacity-70 bg-gray-100' : ''} flex flex-col`}
                onDoubleClick={handleDoubleClick}
            >
                <div className="relative h-48 flex-shrink-0">
                    <img
                        src={getFullImageUrl(item.imageUrls[currentImageIndex])}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {isSold && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">SOLD</span>
                        </div>
                    )}
                    {item.imageUrls.length > 1 && (
                        <div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white rounded-full p-1"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white rounded-full p-1"
                                onClick={nextImage}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="absolute top-1 right-1 p-1 rounded-full bg-white/70">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="left">
                            {!isSold && (
                                <DropdownMenuItem onClick={() => setIsMarkAsSoldModalOpen(true)}>
                                    Mark as Sold
                                </DropdownMenuItem>
                            )}
                            {isSold && (
                                <DropdownMenuItem onClick={handleReactivate}>
                                    Reactivate Listing
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="p-3 bg-gradient-to-b from-gray-50 to-gray-100 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h3>
                            <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-1">
                            {item.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="bg-orange-100 text-orange-800 text-xs px-1 py-0.5 rounded-full">
                                    {tag}
                                </span>
                            ))}
                            {item.tags.length > 2 && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-1 py-0.5 rounded-full">
                                    +{item.tags.length - 2}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                        <p className="text-gray-500">Listed: {new Date(item.listingDate).toLocaleDateString()}</p>
                        {isSold && item.purchaseDate && (
                            <p className="text-gray-500">Sold: {new Date(item.purchaseDate).toLocaleDateString()}</p>
                        )}
                        {!isSold && (
                            <Button
                                onClick={handleEditClick}
                                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center text-xs px-2 py-1"
                            >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
            <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                <DialogContent className="sm:max-w-[625px] bg-orange-50 border-2 border-orange-300">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-orange-700">Edit Listing</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-6 py-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='title' className='text-right font-medium text-orange-600'>Title</label>
                            <Input
                                id='title'
                                name='title'
                                value={editedItem.title}
                                onChange={handleInputChange}
                                className='col-span-3 border-orange-300 focus:border-orange-500'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='price' className='text-right font-medium text-orange-600'>Price</label>
                            <Input
                                id='price'
                                name='price'
                                type='text'
                                value={priceInput}
                                onChange={handlePriceChange}
                                onBlur={handlePriceBlur}
                                className='col-span-3 border-orange-300 focus:border-orange-500'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='description' className='text-right font-medium text-orange-600'>Description</label>
                            <Textarea
                                id='description'
                                name='description'
                                value={editedItem.description}
                                onChange={handleInputChange}
                                className='col-span-3 border-orange-300 focus:border-orange-500'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='tags' className='text-right font-medium text-orange-600'>Tags</label>
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
                                        className='flex-grow border-orange-300 focus:border-orange-500'
                                    />
                                    <Button onClick={handleAddTag} type='button' className="bg-orange-500 hover:bg-orange-600 text-white">Add Tag</Button>
                                </div>
                            </div>
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='image' className='text-right font-medium text-orange-600'>Images</label>
                            <div className='col-span-3'>
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {imagePreviewUrls.map((imageData, index) => (
                                        <div key={index} className='relative group'>
                                            <img
                                                src={imageData.isNew ? imageData.url : getFullImageUrl(imageData.url)}
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
                                    <FileInput
                                        id='image'
                                        accept='image/*'
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        multiple
                                        className="border-orange-300 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type='submit' onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isConfirmCloseDialogOpen} onOpenChange={setIsConfirmCloseDialogOpen}>
                <AlertDialogContent className="bg-orange-50 border-2 border-orange-300">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-orange-700">Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription className="text-orange-600">
                            You have unsaved changes. Are you sure you want to close without saving?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-200 text-orange-700 hover:bg-gray-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmClose} className="bg-orange-500 hover:bg-orange-600 text-white">Close without saving</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isConfirmSaveDialogOpen} onOpenChange={setIsConfirmSaveDialogOpen}>
                <AlertDialogContent className="bg-orange-50 border-2 border-orange-300">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-orange-700">Confirm Save</AlertDialogTitle>
                        <AlertDialogDescription className="text-orange-600">
                            Are you sure you want to save your changes?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-200 text-orange-700 hover:bg-gray-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSave} className="bg-orange-500 hover:bg-orange-600 text-white">Save changes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isMarkAsSoldModalOpen} onOpenChange={setIsMarkAsSoldModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-orange-50 border-2 border-orange-300">
                    <div className="flex justify-center">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-orange-700">Mark Item as Sold</DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className='grid gap-4 py-4'>
                        <div className='space-y-2'>
                            <label htmlFor='buyer' className='text-sm font-medium text-orange-600'>Select Buyer</label>
                            <Select onValueChange={setSelectedBuyerId}>
                                <SelectTrigger className='w-full border-orange-300 focus:border-orange-500'>
                                    <SelectValue placeholder="Choose a buyer" />
                                </SelectTrigger>
                                <SelectContent className="bg-orange-50">
                                    {buyers.map(buyer => (
                                        <SelectItem key={buyer.id} value={buyer.id.toString()} className="flex items-center space-x-2 p-2">
                                            <div className="flex flex-row items-center space-x-2 w-full">
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarImage src={getFullProfileImageUrl(buyer.profileImageUrl)} alt={`${buyer.firstName} ${buyer.lastName}`} />
                                                    <AvatarFallback>{buyer.firstName[0]}{buyer.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-row items-center space-x-2 flex-grow min-w-0">
                                                    <p className="text-sm text-orange-700 whitespace-nowrap">{buyer.firstName} {buyer.lastName}</p>
                                                    <p className="text-sm text-orange-600 whitespace-nowrap">{buyer.email}</p>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleMarkAsSold}
                            disabled={!selectedBuyerId}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Mark as Sold
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default ListingItemCard