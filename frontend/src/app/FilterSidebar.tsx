"use client"

import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterSidebarProps } from '@/types/FilterSidebarProps'

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sortOptions,
  priceFilter = false,
  minPrice,
  maxPrice,
  dateFilter = false,
  onSort,
  onPriceFilter,
  onDateFilter,
  onSearch
}) => {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleSort = (sortBy: string) => {
    onSort(sortBy)
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onPriceFilter && onPriceFilter(value[0], value[1])
  }

  const handleDateChange = (value: [Date | null, Date | null]) => {
    setDateRange(value)
    if (value[0] && value[1]) {
      onDateFilter && onDateFilter(value[0], value[1])
    }
  }

  return (
    <aside className='fixed top-0 left-0 w-56 h-screen bg-orange-50 shadow-md border-r border-orange-200 flex items-center'>
      <div className='max-h-screen overflow-y-auto flex flex-col space-y-3 py-3 px-2 -mt-10'>
        <div className='bg-white rounded shadow p-3'>
          <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Search Descriptions</h3>
          <Input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={handleSearch}
            className='w-full text-sm'
          />
        </div>
        <div className='bg-white rounded shadow p-3'>
          <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Sort By</h3>
          <div className='flex flex-wrap justify-center'>
            {[...sortOptions, { label: 'Oldest First', value: 'date_asc' }].map(option => (
              <Button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className='m-0.5 text-xs bg-orange-500 hover:bg-orange-600 text-white'
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        {priceFilter && (
          <div className='bg-white rounded shadow p-3'>
            <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Price Range</h3>
            <Slider
              min={minPrice}
              max={maxPrice}
              step={(maxPrice - minPrice) / 100}
              value={priceRange}
              onValueChange={handlePriceChange}
              className='my-4'
            />
            <div className='flex justify-between mt-2 text-xs text-gray-600'>
              <span>${priceRange[0].toFixed(2)}</span>
              <span>${priceRange[1].toFixed(2)}</span>
            </div>
          </div>
        )}
        {dateFilter && (
          <div className='bg-white rounded shadow p-3'>
            <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Date Listed</h3>
            <div className='flex flex-col space-y-1'>
              <Input
                type='date'
                value={dateRange[0]?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange([new Date(e.target.value), dateRange[1]])}
                className='w-full text-xs'
              />
              <Input
                type='date'
                value={dateRange[1]?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange([dateRange[0], new Date(e.target.value)])}
                className='w-full text-xs'
              />
            </div>
            <div className='flex justify-between mt-2 text-xs text-gray-600'>
              <span>{dateRange[0]?.toLocaleDateString() || 'Start'}</span>
              <span>{dateRange[1]?.toLocaleDateString() || 'End'}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default FilterSidebar