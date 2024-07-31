export interface Item {
    id: number
    title: string
    price: number
    imageUrl: string
    description: string
    createdAt: string
    seller: {
        firstName: string
        lastName: string
        email: string
    }
}