"use client"

import Link from "next/link"
import BeakerIcon from "@/components/ui/BeakerIcon"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { FaSearch, FaShoppingCart, FaUserCircle } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../app/AuthContext'
import { Input } from "@/components/ui/input"

export default function NavBar() {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const [watchItems, setWatchItems] = useState([])

  // const fetchCartItems = async () => {
  //   if (isAuthenticated && user) {
  //     //include api call
  //     const response = await fetch(`/api/cart/${user.id}`)
  //     const data = await response.json();
  //     setWatchItems(data);
  //   }
  // };

  return (
    <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center justify-between bg-[black] text-[white]">
      <div className="flex items-center">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <BeakerIcon />
          <span className="text-2xl font-bold text-orange-500">BeaverBargains</span>
        </Link>
      </div>
      <div className="flex-1 max-w-md mx-4 relative">
        <Input
          type="search"
          placeholder="Search BeaverBargains"
          className="w-full bg-gray-800 text-white placeholder-gray-400 border border-white rounded-md pr-12"
        />
        <button
          className="absolute right-[3px] top-[3px] bottom-[3px] px-3 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-r-[4px] transition-colors duration-200"
          onClick={() => {/*add search functionality here*/ }}
        >
          <FaSearch />
        </button>
      </div>
      <nav className="flex gap-4 sm:gap-6 items-center">
        <Link href="/buy" className="text-sm font-medium hover:underline underline-offset-4 text-orange-500" prefetch={false}>
          Marketplace
        </Link>
        <Link href="/sell" className="text-sm font-medium hover:underline underline-offset-4 text-orange-500" prefetch={false}>
          Sell
        </Link>
        <Drawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} direction="right">
          <DrawerTrigger asChild>
            <span className="text-sm font-medium hover:underline underline-offset-4 text-orange-500 flex items-center cursor-pointer" onClick={() => setProfileDrawerOpen(true)}>
              <FaUserCircle className="text-2xl" />
              {isAuthenticated && user && <span className="ml-2">{user.firstName}</span>}
            </span>
          </DrawerTrigger>
          <DrawerContent className="top-0 right-0 left-auto mt-0 w-[333px] rounded-none">
            <DrawerHeader className="flex justify-between items-center">
              <DrawerTitle>{isAuthenticated && user ? `Welcome ${user.firstName}!` : 'Welcome Guest!'}</DrawerTitle>
              <DrawerClose asChild>
              </DrawerClose>
            </DrawerHeader>
            {isAuthenticated ? (
              <DrawerFooter>
                <Button onClick={logout} className="w-full bg-orange-500 text-white hover:bg-orange-600">
                  Logout
                </Button>
              </DrawerFooter>
            ) : (
              <DrawerFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                    Login
                  </Button>
                </Link>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      </nav>
    </header>
  )
}