'use client'

import { cn } from '@/lib/utils/utils'

interface CategoryPillsProps {
  categories: string[]
  selectedCategory: string | null
  onSelect: (category: string | null) => void
  className?: string
}

export function CategoryPills({
  categories,
  selectedCategory,
  onSelect,
  className = '',
}: CategoryPillsProps) {
  const handleClick = (category: string) => {
    if (selectedCategory === category) {
      onSelect(null)
    } else {
      onSelect(category)
    }
  }

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 hide-scrollbar', className)}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleClick(category)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
            selectedCategory === category
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
          )}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  )
}