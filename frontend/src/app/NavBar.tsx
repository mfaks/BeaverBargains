"use client"

import Link from "next/link"
import BeakerIcon from "@/components/ui/BeakerIcon"
import { Button } from "@/components/ui/button"
import { FaSearch, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../app/AuthContext'
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span className="text-sm font-medium hover:underline underline-offset-4 text-orange-500 flex items-center cursor-pointer">
              <FaUserCircle className="text-2xl" />
              {isAuthenticated && user && <span className="ml-2">{user.firstName}</span>}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel className="text-center">
              {isAuthenticated && user ? `Welcome ${user.firstName}!` : 'Welcome Guest!'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAuthenticated ? (
              <DropdownMenuItem onClick={logout}>
                Logout
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem>
                  <Link href="/login" className="w-full">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/register" className="w-full">
                    Create Account
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}