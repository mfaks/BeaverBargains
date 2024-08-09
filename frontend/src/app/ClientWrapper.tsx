"use client"

import React from 'react'
import { AuthProviderWrapper } from './auth/AuthProviderWrapper'
import { UnreadMessagesProvider } from './messages/UnreadMessagesContext'
import { useAuth } from './auth/AuthContext'

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
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export default ClientWrapper