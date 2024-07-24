import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../app/AuthContext"
import { AuthProviderWrapper } from './AuthProviderWrapper'
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BeaverBargains - The Marketplace for Beavs",
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  )
}