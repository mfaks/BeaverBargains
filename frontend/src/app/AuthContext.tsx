"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'

interface User {
  id: string | number
  firstName: string
  lastName: string
  email: string
  bio: string
  profileImage?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  logout: () => void
  updateUserProfileImage: (newImageUrl: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)
      setIsAuthenticated(true)
      setUser(userData)
      setToken(storedToken)
    }
  }, [])

  const login = (userData: User, newToken: string) => {
    setIsAuthenticated(true)
    setUser(userData)
    setToken(newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', newToken)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }


  const updateUserProfileImage = (newImageUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profileImage: newImageUrl }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  } 

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, updateUserProfileImage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}