'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface ConsultantSearchFiltersProps {
  categories: string[]
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  onSearch: (search: string) => void
  searchValue: string
}

export function ConsultantSearchFilters({
  categories,
  selectedCategory,
  onCategorySelect,
  onSearch,
  searchValue,
}: ConsultantSearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const debouncedSearch = useDebounce(localSearch, 300)
  const previousDebouncedRef = useRef<string>(debouncedSearch)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    if (debouncedSearch !== previousDebouncedRef.current) {
      previousDebouncedRef.current = debouncedSearch
      onSearch(debouncedSearch)
    }
  }, [debouncedSearch, onSearch])

  useEffect(() => {
    if (searchValue !== localSearch) {
      setLocalSearch(searchValue)
    }
  }, [searchValue])

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategorySelect(null)
    } else {
      onCategorySelect(category)
    }
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    onSearch('')
  }

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-outline" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name, specialization, or category..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
        />
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}