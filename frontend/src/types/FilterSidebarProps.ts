export interface FilterSidebarProps {
  sortOptions: { label: string; value: string }[];
  priceFilter?: boolean;
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onSort: (sortBy: string) => void;
  onPriceFilter: (minPrice: number, maxPrice: number) => void;
  onDescriptionSearch: (term: string) => void;
  onTagSearch: (term: string) => void;
  onTagFilter: (tags: string[]) => void;
  allTags: string[];
  resetTrigger: number;
}
