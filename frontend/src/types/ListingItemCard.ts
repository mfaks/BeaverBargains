import { Item } from './Item'

export interface ListingItemCardProps {
    item: Item
    getFullImageUrl: (imageUrl: string) => string
    isSelected: boolean
    onToggleSelect: () => void
    token: string
    onItemUpdate: (updatedItem: Item) => void
}
