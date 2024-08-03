import { FilterOption } from "./FilterOptions"

export interface FilterSidebarProps {
    sortOptions: FilterOption[]
    priceFilter?: boolean
    minPrice: number
    maxPrice: number
    categoryFilter?: boolean
    dateFilter?: boolean
    onSort: (sortBy: string) => void
    onPriceFilter?: (minPrice: number, maxPrice: number) => void
    onDateFilter?: (startDate: Date, endDate: Date) => void
    onCustomFilter?: (filterName: string, value: string[]) => void
    onSearch: (searchTerm: string) => void
}