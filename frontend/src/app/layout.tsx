import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientWrapper from './ClientWrapper'
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
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <Toaster />
      </body>
    </html>
  )
}