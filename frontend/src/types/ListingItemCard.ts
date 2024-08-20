import { Item } from './Item'

export interface ListingItemCardProps {
    item: Item
    getFullImageUrl: (url: string) => string
    isSelected: boolean
    onToggleSelect: (id: number) => void
    token: string | null
    onItemUpdate: (item: Item) => void
    onMarkAsSold: (itemId: number, buyerId: number, purchaseDate: string) => Promise<void>
    isSold: boolean
}