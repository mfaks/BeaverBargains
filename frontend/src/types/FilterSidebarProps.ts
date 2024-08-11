export interface FilterSidebarProps {
    sortOptions: { label: string; value: string }[]
    priceFilter?: boolean
    minPrice: number
    maxPrice: number
    onSort: (sortBy: string) => void
    onPriceFilter?: (minPrice: number, maxPrice: number) => void
    onDescriptionSearch: (searchTerm: string) => void
    onTagSearch: (searchTerm: string) => void
    onTagFilter: (tags: string[]) => void
    allTags: string[]
}