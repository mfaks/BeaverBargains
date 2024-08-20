"use client"

import React from 'react'
import { AuthProviderWrapper } from '../components/auth/AuthProviderWrapper'
import { UnreadMessagesProvider } from './messages/UnreadMessagesContext'
import { useAuth } from '../components/auth/AuthContext'
import { Skeleton } from "@/components/ui/skeleton"

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProviderWrapper>
      <UnreadMessagesProvider>
        <AuthStateWrapper>
          {children}
        </AuthStateWrapper>
      </UnreadMessagesProvider>
    </AuthProviderWrapper>
  )
}

const AuthStateWrapper = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    )
  }

  return <>{children}</>
}

export default ClientWrapper