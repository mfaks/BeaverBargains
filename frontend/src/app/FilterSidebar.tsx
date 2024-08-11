"use client"

import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FilterSidebarProps } from '@/types/FilterSidebarProps'

const FilterSidebar: React.FC<FilterSidebarProps> = ({ sortOptions, priceFilter = false, minPrice, maxPrice, onSort, onPriceFilter, onDescriptionSearch, onTagSearch, onTagFilter, allTags }) => {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState('')
  const [tagSearchTerm, setTagSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState(allTags)

  useEffect(() => {
    setPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  useEffect(() => {
    setFilteredTags(
      allTags.filter(tag => 
        tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
      )
    )
  }, [tagSearchTerm, allTags])

  const handleDescriptionSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setDescriptionSearchTerm(value)
    onDescriptionSearch(value)
  }

  const handleTagSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTagSearchTerm(value)
    onTagSearch(value)
  }

  const handleSort = (sortBy: string) => {
    onSort(sortBy)
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onPriceFilter && onPriceFilter(value[0], value[1])
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      onTagFilter(newTags)
      return newTags
    })
  }

  return (
    <aside className='fixed top-0 left-0 w-56 h-screen bg-orange-50 shadow-md border-r border-orange-200 flex items-center'>
      <div className='max-h-screen overflow-y-auto flex flex-col space-y-3 py-3 px-2 -mt-10'>
        <div className='bg-white rounded shadow p-3'>
          <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Description Search</h3>
          <Input
            type='text'
            placeholder='Search descriptions...'
            value={descriptionSearchTerm}
            onChange={handleDescriptionSearch}
            className='w-full text-sm'
          />
        </div>
        <div className='bg-white rounded shadow p-3'>
          <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Sort By</h3>
          <div className='flex flex-wrap justify-center'>
            {sortOptions.map(option => (
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
        <div className='bg-white rounded shadow p-3'>
          <h3 className='text-center text-sm font-semibold mb-2 text-orange-600 border-b border-orange-200 pb-1'>Tags</h3>
          <Input
            type='text'
            placeholder='Search tags...'
            value={tagSearchTerm}
            onChange={handleTagSearch}
            className='w-full text-sm mb-2'
          />
          <ScrollArea className='h-40'>
            {filteredTags.map(tag => (
              <div key={tag} className='flex items-center space-x-2 mb-1'>
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                <label htmlFor={tag} className='text-sm text-gray-700'>{tag}</label>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
}

export default FilterSidebar