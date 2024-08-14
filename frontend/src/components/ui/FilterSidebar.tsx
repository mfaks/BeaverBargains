"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FilterSidebarProps } from '@/types/FilterSidebarProps'

const FilterSidebar: React.FC<FilterSidebarProps> = ({ sortOptions, priceFilter = false, minPrice, maxPrice, onSort, onPriceFilter, onDescriptionSearch, onTagSearch, onTagFilter, allTags, resetTrigger }) => {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState('')
  const [tagSearchTerm, setTagSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState(allTags)

  const shouldResetRef = useRef(false)

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

  useEffect(() => {
    shouldResetRef.current = true
  }, [resetTrigger])

  useEffect(() => {
    if (shouldResetRef.current) {
      setDescriptionSearchTerm('')
      setTagSearchTerm('')
      setSelectedTags([])
      setPriceRange([minPrice, maxPrice])
      onDescriptionSearch('')
      onTagSearch('')
      onTagFilter([])
      shouldResetRef.current = false
    }
  }, [minPrice, maxPrice, onDescriptionSearch, onTagSearch, onTagFilter])

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
    onPriceFilter(value[0], value[1])
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
    <aside className='w-64 border-r border-orange-500 h-full bg-orange-400'>
      <div className='flex-grow flex flex-col space-y-4 p-4'>
        <div className='bg-orange-200 rounded shadow p-3'>
          <h3 className='text-center text-sm font-bold mb-2 text-orange-700 border-b border-orange-400 pb-1 tracking-wide'>Description Search</h3>
          <Input
            type='text'
            placeholder='Search descriptions...'
            value={descriptionSearchTerm}
            onChange={handleDescriptionSearch}
            className='w-full text-sm bg-orange-100 text-orange-700 placeholder-orange-500 border-orange-400 focus:ring-orange-500 font-medium'
          />
        </div>
        <div className='bg-orange-200 rounded shadow p-3'>
          <h3 className='text-center text-sm font-bold mb-2 text-orange-700 border-b border-orange-400 pb-1 tracking-wide'>Sort By</h3>
          <div className='flex flex-wrap justify-center'>
            {sortOptions.map(option => (
              <Button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className='m-0.5 text-xs bg-orange-400 hover:bg-orange-500 text-white font-semibold shadow-md'
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        {priceFilter && (
          <div className='bg-orange-200 rounded shadow p-3'>
            <h3 className='text-center text-sm font-bold mb-2 text-orange-700 border-b border-orange-400 pb-1 tracking-wide'>Price Range</h3>
            <Slider
              min={minPrice}
              max={maxPrice}
              step={(maxPrice - minPrice) / 100}
              value={priceRange}
              onValueChange={handlePriceChange}
              className='my-4'
            />
            <div className='flex justify-between mt-2 text-xs text-orange-700 font-semibold'>
              <span>${priceRange[0].toFixed(2)}</span>
              <span>${priceRange[1].toFixed(2)}</span>
            </div>
          </div>
        )}
        <div className='bg-orange-200 rounded shadow p-3'>
          <h3 className='text-center text-sm font-bold mb-2 text-orange-700 border-b border-orange-400 pb-1 tracking-wide'>Tags</h3>
          <Input
            type='text'
            placeholder='Search tags...'
            value={tagSearchTerm}
            onChange={handleTagSearch}
            className='w-full text-sm mb-2 bg-orange-100 text-orange-700 placeholder-orange-500 border-orange-400 focus:ring-orange-500 font-medium'
          />
          <ScrollArea className='h-40'>
            {filteredTags.map(tag => (
              <div key={tag} className='flex items-center space-x-2 mb-1'>
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                  className='border-orange-400 text-orange-600'
                />
                <label htmlFor={tag} className='text-sm text-orange-700 font-medium'>{tag}</label>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
}

export default FilterSidebar