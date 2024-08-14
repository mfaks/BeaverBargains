import { OrderItem } from './OrderItem'

export interface OrderHistoryCardProps {
    order: OrderItem
    currentImageIndex: number
    onPrevImage: () => void
    onNextImage: () => void
    getFullImageUrl: (url: string) => string
}