import { Item } from './Item'

export interface ListingItemCardProps {
    item: Item
    getFullImageUrl: (imageUrl: string) => string
    isSelected: boolean
    onToggleSelect: () => void
    token: string | null
    onItemUpdate: (updatedItem: Item) => void
    onMarkAsSold: (itemId: number) => Promise<void>
    isSold: boolean
}