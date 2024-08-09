import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProviderWrapper } from './auth/AuthProviderWrapper'
import { UnreadMessagesProvider } from './messages/UnreadMessagesContext'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BeaverBargains - The Marketplace for Beavs',
  icons: {
    icon: '/beaver.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AuthProviderWrapper>
          <UnreadMessagesProvider>
            {children}
          </UnreadMessagesProvider>
        </AuthProviderWrapper>
        <Toaster />
      </body>
    </html>
  )
}
