"use client"

import Link from "next/link"
import BeakerIcon from "@/components/ui/BeakerIcon"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../app/AuthContext'

export default function NavBar() {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center bg-[black] text-[white]">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <BeakerIcon />
        <span className="text-2xl font-bold text-orange-500">BeaverBargains</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link href="/buy" className="text-sm font-medium hover:underline underline-offset-4 text-orange-500" prefetch={false}>
          Buy
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
                {/* <Button
                  onClick={() => setProfileDrawerOpen(false)}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  &times;
                </Button> */}
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