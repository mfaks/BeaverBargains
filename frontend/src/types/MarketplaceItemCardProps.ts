import { Item } from "./Item"

export interface MarketplaceItemCardProps {
    item: Item
    onToggleFavorite: (itemId: number) => void
    getFullImageUrl: (imageUrl: string) => string
}