import { Item } from './Item'

export interface ListingItemCardProps {
    item: Item
    getFullImageUrl: (url: string) => string
    isSelected: boolean
    onToggleSelect: () => void
    token: string | null
    onItemUpdate: (item: Item) => void
    onMarkAsSold: (itemId: number, buyerId: number) => Promise<void>
    isSold: boolean
}