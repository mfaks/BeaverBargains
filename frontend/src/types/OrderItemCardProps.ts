import { OrderItem } from './OrderItem'

export interface OrderItemCardProps {
    order: OrderItem
    currentImageIndex: number
    onPrevImage: () => void
    onNextImage: () => void
    getFullImageUrl: (url: string) => string
}