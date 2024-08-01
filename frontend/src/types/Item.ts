export interface Item {
    id: number
    title: string
    price: number
    imageUrl: string
    description: string
    listingDate: string
    isFavorited: boolean
    seller: {
        firstName: string
        lastName: string
        email: string
    }
}