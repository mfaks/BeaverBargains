import { User } from './User'
export interface AuthContext {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    login: (userData: User, token: string) => void
    logout: () => void
    updateUserProfileImage: (newImageUrl: string) => void
}