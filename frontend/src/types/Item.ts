export interface Item {
    id: number
    title: string
    price: number
    description: string
    imageUrls: string[]
    tags: string[]
    listingDate: string
    purchaseDate: string
    isFavorited: boolean
    status: 'ACTIVE' | 'SOLD'
    seller: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
}