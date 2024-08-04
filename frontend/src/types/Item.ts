export interface Item {
    id: number
    title: string
    price: number
    imageUrl: string
    description: string
    listingDate: string
    isFavorited: boolean
    seller: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
}