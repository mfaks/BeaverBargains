export interface OrderItem {
    id: number
    title: string
    price: number
    seller: {
        firstName: string
        lastName: string
    }
    listingDate: string
    purchaseDate: string
    imageUrls: string[]
    tags: string[]
}