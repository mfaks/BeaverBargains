"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { User } from '../../types/User'
import type { AuthContext } from '../../types/AuthContext'
import { AuthProviderProps } from '../../types/AuthProviderProps'

const AuthContext = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)
      setIsAuthenticated(true)
      setUser(userData)
      setToken(storedToken)
    }
    setLoading(false)
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

  const contextValue: AuthContext = { isAuthenticated, user, token, loading, login, logout, updateUserProfileImage }

  return (
    <AuthContext.Provider value={contextValue}>
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