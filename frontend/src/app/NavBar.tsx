"use client"

import Link from "next/link"
import BeakerIcon from "@/components/ui/BeakerIcon"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa'
import { useState } from 'react'

const Navbar = () => {

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)

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

        <Popover>
          <PopoverTrigger asChild>
            <span className="text-sm font-medium hover:underline underline-offset-4 text-orange-500 cursor-pointer">
              FAQs
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h2 className="font-bold">Frequently Asked Questions</h2>
            <p className="text-sm">Here you can add your FAQ content or links to specific questions.</p>
          </PopoverContent>
        </Popover>

        <Drawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen} direction="right">
          <DrawerTrigger asChild>
            <span className="text-sm font-medium hover:underline underline-offset-4 text-orange-500 flex items-center cursor-pointer" onClick={() => setCartDrawerOpen(true)}>
              <FaShoppingCart className="mr-2" />
              View Cart
            </span>
          </DrawerTrigger>
          <DrawerContent className="top-0 right-0 left-auto mt-0 w-[300px] rounded-none">
            <DrawerHeader className="flex justify-between items-center">
              <DrawerTitle>My Cart: </DrawerTitle>
              <DrawerClose asChild>
                <Button
                  onClick={() => setCartDrawerOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </Button>
              </DrawerClose>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>

        <Drawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} direction="right">
          <DrawerTrigger asChild>
            <span className="text-sm font-medium hover:underline underline-offset-4 text-orange-500 flex items-center cursor-pointer" onClick={() => setProfileDrawerOpen(true)}>
              <FaUserCircle className="text-2xl" />
            </span>
          </DrawerTrigger>
          <DrawerContent className="top-0 right-0 left-auto mt-0 w-[333px] rounded-none">
            <DrawerHeader className="flex justify-between items-center">
              <DrawerTitle>Welcome User!</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  onClick={() => setProfileDrawerOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </Button>
              </DrawerClose>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>



      </nav>
    </header>
  )
}

export default Navbar