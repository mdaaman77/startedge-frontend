'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface ConsultationFiltersProps {
  filters: {
    search: string
    status: string
    dateRange: 'all' | 'today' | 'week' | 'month'
  }
  onApply: (filters: any) => void
  onReset: () => void
  statusOptions: string[]
  role: 'client' | 'consultant'
}

export function ConsultationFilters({
  filters,
  onApply,
  onReset,
  statusOptions,
  role,
}: ConsultationFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [isExpanded, setIsExpanded] = useState(false)

  const searchPlaceholder = role === 'client' 
    ? 'Search by consultant name...' 
    : 'Search by client name...'

  const handleChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApply(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({
      search: '',
      status: 'all',
      dateRange: 'all',
    })
    onReset()
  }

  return (
    <div className="w-full bg-surface-container rounded-xl border border-outline-variant/30 p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg border border-outline-variant/30 hover:bg-surface-variant transition-colors"
        >
          <Filter className="w-5 h-5 text-on-surface-variant" />
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg transition-colors hover:opacity-90"
        >
          Apply
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/30">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Status
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Date Range
            </label>
            <select
              value={localFilters.dateRange}
              onChange={(e) => handleChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-2 border border-outline-variant/30 rounded-lg hover:bg-surface-variant transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}