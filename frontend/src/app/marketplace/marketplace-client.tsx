"use client"

import { useSearchParams } from 'next/navigation'
import Marketplace from './Marketplace'

export default function MarketplaceClient() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  return <Marketplace searchQuery={searchQuery} />
}