"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import BeaverIcon from '@/components/ui/BeaverIcon'
import { Button } from '@/components/ui/button'
import { FaSearch, FaUserCircle, FaHome, FaShoppingCart, FaHeart, FaBars, FaSignInAlt, FaUserPlus, FaUser, FaFacebookMessenger, FaList, FaTags } from 'react-icons/fa'
import { useAuth } from '../../app/auth/AuthContext'
import { useUnreadMessages } from '../../app/messages/UnreadMessagesContext'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/types/User'
import { ShoppingBag } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface NavBarProps {
  searchQuery?: string;
}

export default function NavBar({ searchQuery = '' }: NavBarProps) {
  const { isAuthenticated, user, logout, token } = useAuth()
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const { unreadCount, fetchUnreadCount, clearUnreadCount } = useUnreadMessages()
  const router = useRouter()
  const [fullProfileImageUrl, setFullProfileImageUrl] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, token, fetchUnreadCount])

  useEffect(() => {
    if (user && user.profileImageUrl) {
      setFullProfileImageUrl(getFullImageUrl(user.profileImageUrl))
    }
  }, [user, user?.profileImageUrl])

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token')
          const config = {
            headers: { Authorization: `Bearer ${token}` }
          }
          const response = await axios.get<User>(`http://localhost:8080/api/users/${user.id}`, config)
          const updatedUser = response.data
          setFullProfileImageUrl(getFullImageUrl(updatedUser.profileImageUrl))
        } catch (error) {
          console.error('Error fetching user information:', error)
        }
      }
    }

    fetchUserInfo()
  }, [isAuthenticated, user])

  useEffect(() => {
    setSearchTerm(searchQuery)
  }, [searchQuery])

  const BASE_URL = 'http://localhost:8080'
  const getFullImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return ''
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }
    return `${BASE_URL}/uploads/${imageUrl}`
  }

  const handleLogout = async () => {
    logout()
    clearUnreadCount()
    toast({
      title: "Logout Successful",
      description: "You have been successfully logged out of your account.",
      duration: 3000,
    })
    setTimeout(() => {
      window.location.href = `/login`
    }, 3000)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isAuthenticated) {
      if (searchTerm.trim()) {
        router.push(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`)
      } else {
        router.push('/marketplace')
      }
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between bg-black text-orange-500 shadow-lg">
        <div className="flex items-center">
          <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity" prefetch={false}>
            <BeaverIcon className="w-10 h-10" />
            <span className="text-2xl font-bold text-orange-500 ml-2">BeaverBargains</span>
          </Link>
        </div>
        <div className="flex-grow mx-4">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <Input
              type="search"
              placeholder={isAuthenticated ? "Search BeaverBargains" : "Login to search"}
              className="w-full bg-gray-900 text-white placeholder-orange-300 border-2 border-orange-500 rounded-full pr-12 focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isAuthenticated}
            />
            <button
              type="submit"
              className={`absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center ${isAuthenticated ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-full transition-colors duration-200`}
              disabled={!isAuthenticated}
            >
              <FaSearch />
            </button>
          </form>
        </div>
        <nav className="flex gap-4 sm:gap-6 items-center">
          {isAuthenticated && (
            <Button
              onClick={() => router.push('/sell')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <FaTags className="mr-2" /> Sell Items
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-orange-900 border-2 border-orange-500 rounded-full relative">
                <div className="flex items-center space-x-1 p-1">
                  {isAuthenticated && user ? (
                    <Avatar className="w-8 h-8 border-2 border-orange-500">
                      <AvatarImage src={fullProfileImageUrl} alt={user?.firstName || 'User'} />
                      <AvatarFallback className="bg-orange-500 text-black text-xs">
                        {user.firstName.charAt(0).toUpperCase()}
                        {user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <FaUserCircle className="text-2xl text-orange-500" />
                  )}
                  <FaBars className="text-lg text-orange-500" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-orange-50 text-orange-900 border border-orange-200 shadow-lg">
              <DropdownMenuLabel className="text-center text-orange-800 font-semibold">
                {isAuthenticated && user ? `Welcome ${user.firstName}!` : 'Welcome Guest!'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-orange-200" />
              {isAuthenticated ? (
                <div>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100 relative">
                    <Link href="/messages" className="w-full flex items-center text-orange-700">
                      <FaFacebookMessenger className="mr-2" /> Messages
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/favorites" className="w-full flex items-center text-orange-700">
                      <FaHeart className="mr-2" /> Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/listings" className="w-full flex items-center text-orange-700">
                      <FaList className="mr-2" /> My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/orders" className="w-full flex items-center text-orange-700">
                      <FaShoppingCart className="mr-2" /> Order History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/marketplace" className="w-full flex items-center text-orange-700">
                      <ShoppingBag className="mr-2 h-4 w-4" /> Marketplace
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/account" className="w-full flex items-center text-orange-700">
                      <FaUser className="mr-2" /> My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-200" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-orange-100 focus:bg-orange-100 text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </div>
              ) : (
                <div>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/login" className="w-full flex items-center text-orange-700">
                      <FaSignInAlt className="mr-2" /> Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-100 focus:bg-orange-100">
                    <Link href="/register" className="w-full flex items-center text-orange-700">
                      <FaUserPlus className="mr-2" /> Create Account
                    </Link>
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
    </div>
  )
}