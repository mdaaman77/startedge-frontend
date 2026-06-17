'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { ConsultantCard } from './ConsultantCard'
import { Consultant } from '@/lib/api/consultant'
import { useListConsultantsQuery } from '@/lib/api/consultant'

interface ConsultantScrollProps {
  title?: string
  subtitle?: string
  limit?: number
  showViewAll?: boolean
}

export function ConsultantScroll({
  title = 'Top Rated Experts',
  subtitle = 'Our highest-rated consultants trusted by thousands',
  limit = 10,
  showViewAll = true,
}: ConsultantScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: consultants, isLoading, error } = useListConsultantsQuery({
    sort_by: 'rating',
    order: 'desc',
    limit: limit,
  })

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    const currentScroll = scrollRef.current.scrollLeft
    scrollRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-surface-container-low">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            <p className="text-on-surface-variant">{subtitle}</p>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="min-w-[260px] max-w-[260px] glass-card p-4 rounded-xl animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-surface-variant" />
                  <div>
                    <div className="h-4 w-24 bg-surface-variant rounded mb-1" />
                    <div className="h-3 w-16 bg-surface-variant rounded" />
                  </div>
                </div>
                <div className="flex justify-between mb-3">
                  <div className="h-4 w-16 bg-surface-variant rounded" />
                  <div className="h-4 w-12 bg-surface-variant rounded" />
                </div>
                <div className="h-9 w-full bg-surface-variant rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-surface-container-low">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error">Failed to load consultants. Please try again later.</p>
        </div>
      </section>
    )
  }

  if (!consultants || consultants.length === 0) {
    return (
      <section className="py-20 bg-surface-container-low">
        <div className="container mx-auto px-4 text-center">
          <p className="text-on-surface-variant">No consultants available at the moment.</p>
        </div>
      </section>
    )
  }

  // Sort: online first, then by rating
  const sortedConsultants = [...consultants].sort((a, b) => {
    if (a.is_online === b.is_online) {
      return b.average_rating - a.average_rating
    }
    return a.is_online ? -1 : 1
  })

  return (
    <section className="py-20 bg-surface-container-low">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {title} <span className="gradient-text">Experts</span>
            </h2>
            <p className="text-on-surface-variant">{subtitle}</p>
          </div>
          {showViewAll && (
            <Link href="/client/consultants">
              <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0">
                View All <ArrowRight size={16} />
              </button>
            </Link>
          )}
        </div>

        {/* Scrollable Cards */}
        <div className="relative">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 backdrop-blur-sm border border-outline-variant/30 rounded-full p-2 text-on-surface hover:text-primary transition-colors hidden md:block"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedConsultants.map((consultant, index) => (
              <ConsultantCard key={consultant.id} consultant={consultant} index={index} />
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 backdrop-blur-sm border border-outline-variant/30 rounded-full p-2 text-on-surface hover:text-primary transition-colors hidden md:block"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}