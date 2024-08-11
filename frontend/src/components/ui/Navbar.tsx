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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/User'

export default function NavBar() {
  const { isAuthenticated, user, logout, token } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { unreadCount, fetchUnreadCount, clearUnreadCount } = useUnreadMessages()
  const router = useRouter()
  const [fullProfileImageUrl, setFullProfileImageUrl] = useState('')

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
    setIsDialogOpen(true)
    setTimeout(() => {
      setIsDialogOpen(false)
      window.location.href = `/login`
    }, 2000)
  }

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (isAuthenticated && searchTerm.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`)
    }
    else if (!isAuthenticated) {
      router.push('/login')
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between bg-gradient-to-r from-gray-900 to-black text-white shadow-lg">
        <div className="flex items-center">
          <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity" prefetch={false}>
            <BeaverIcon className="w-10 h-10" />
            <span className="text-2xl font-bold text-orange-400 ml-2">BeaverBargains</span>
          </Link>
        </div>
        <div className="flex-grow mx-4">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <Input
              type="search"
              placeholder={isAuthenticated ? "Search BeaverBargains" : "Login to search"}
              className="w-full bg-gray-800 text-white placeholder-gray-400 border-2 border-orange-500 rounded-full pr-12 focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isAuthenticated}
            />
            <button
              type="submit"
              className={`absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center ${isAuthenticated ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 cursor-not-allowed'} text-white rounded-full transition-colors duration-200`}
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
              <Button variant="ghost" className="p-0 h-auto hover:bg-gray-800 border-2 border-orange-400 rounded-full">
                <div className="flex items-center space-x-1 p-1">
                  {isAuthenticated && user ? (
                    <Avatar className="w-8 h-8 border-2 border-orange-400">
                      <AvatarImage src={fullProfileImageUrl} alt={user?.firstName || 'User'} />
                      <AvatarFallback className="bg-orange-500 text-white text-xs">
                        {user.firstName.charAt(0).toUpperCase()}
                        {user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <FaUserCircle className="text-2xl text-orange-400" />
                  )}
                  <FaBars className="text-lg text-orange-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-800 text-white border border-orange-400">
              <DropdownMenuLabel className="text-center text-orange-400">
                {isAuthenticated && user ? `Welcome ${user.firstName}!` : 'Welcome Guest!'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-orange-400" />
              {isAuthenticated ? (
                <div>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/messages" className="w-full flex items-center">
                      <FaFacebookMessenger className="mr-2" /> Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/favorites" className="w-full flex items-center">
                      <FaHeart className="mr-2" /> Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/listings" className="w-full flex items-center">
                      <FaList className="mr-2" /> My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/orders" className="w-full flex items-center">
                      <FaShoppingCart className="mr-2" /> Order History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/account" className="w-full flex items-center">
                      <FaUser className="mr-2" /> My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-400" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-700 text-red-400">
                    Sign Out
                  </DropdownMenuItem>
                </div>
              ) : (
                <div>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/login" className="w-full flex items-center">
                      <FaSignInAlt className="mr-2" /> Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">
                    <Link href="/register" className="w-full flex items-center">
                      <FaUserPlus className="mr-2" /> Create Account
                    </Link>
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-orange-400">Logout Successful</DialogTitle>
            <DialogDescription>
              You have been successfully logged out of your account. Now redirecting you back to login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="bg-orange-500 hover:bg-orange-600 text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}