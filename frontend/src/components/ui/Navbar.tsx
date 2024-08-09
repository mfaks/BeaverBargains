"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BeaverIcon from '@/components/ui/BeaverIcon'
import { Button } from '@/components/ui/button'
import { FaSearch, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../../app/auth/AuthContext'
import { useUnreadMessages } from '../../app/messages/UnreadMessagesContext'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function NavBar() {
  const { isAuthenticated, user, logout, token } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.profileImage)
  const [searchTerm, setSearchTerm] = useState('')
  const { unreadCount, fetchUnreadCount } = useUnreadMessages()
  const { clearUnreadCount } = useUnreadMessages()
  const router = useRouter()


  useEffect(() => {
    if (user && user.profileImage) {
      setAvatarUrl(user.profileImage)
    }
  }, [user])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, token])

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
    if (searchTerm.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`)
    }
    else {
      router.push(`/marketplace`)
    }
  }

  return (
    <div className='sticky top-0 z-50 w-full'>
      <header className='px-4 lg:px-6 h-14 flex items-center justify-between bg-[black] text-[white] shadow-md'>
        <div className='flex items-center'>
          <Link href='/' className='flex items-center justify-center' prefetch={false}>
            <BeaverIcon />
            <span className='text-2xl font-bold text-orange-500'>BeaverBargains</span>
          </Link>
        </div>
        <form onSubmit={handleSearch} className='flex-1 max-w-md mx-4 relative'>
          <Input
            type='search'
            placeholder='Search BeaverBargains'
            className='w-full bg-gray-800 text-white placeholder-gray-400 border border-white rounded-md pr-12'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type='submit'
            className='absolute right-[3px] top-[3px] bottom-[3px] px-3 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-r-[4px] transition-colors duration-200'
          >
            <FaSearch />
          </button>
        </form>
        <nav className='flex gap-4 sm:gap-6 items-center'>
          <Link href='/marketplace' className='text-sm font-medium hover:underline underline-offset-4 text-orange-500' prefetch={false}>
            Marketplace
          </Link>
          {isAuthenticated && (
            <>
              <Link href='/sell' className='text-sm font-medium hover:underline underline-offset-4 text-orange-500' prefetch={false}>
                Sell
              </Link>
              <Link href='/messages' className='text-sm font-medium hover:underline underline-offset-4 text-orange-500 relative' prefetch={false}>
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className='text-sm font-medium hover:underline underline-offset-4 text-orange-500 flex items-center cursor-pointer'>
                {isAuthenticated && user ? (
                  <Avatar>
                    <AvatarImage src={avatarUrl} alt={user?.firstName} />
                    <AvatarFallback>
                      {user.firstName.charAt(0).toUpperCase()}
                      {user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <FaUserCircle className='text-2xl' />
                )}
                {isAuthenticated && user && <span className='ml-2'>{user.firstName}</span>}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuLabel className='text-center'>
                {isAuthenticated && user ? `Welcome ${user.firstName}!` : 'Welcome Guest!'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                <div>
                  <DropdownMenuItem>
                    <Link href='/account' className='w-full'>
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href='/messages' className='w-full'>
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href='/favorites' className='w-full'>
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href='/listings' className='w-full'>
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href='/orders' className='w-full'>
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign Out
                  </DropdownMenuItem>
                </div>
              ) : (
                <div>
                  <DropdownMenuItem>
                    <Link href='/login' className='w-full'>
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href='/register' className='w-full'>
                      Create Account
                    </Link>
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout Successful</DialogTitle>
            <DialogDescription>
              You have been successfully logged out of your account. Now redirecting you back to login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}