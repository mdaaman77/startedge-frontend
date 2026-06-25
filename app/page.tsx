'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Clock } from 'lucide-react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { useListConsultantsQuery } from '@/lib/api/consultant'
import { useAuth } from '@/hooks/useAuth'
import { ConsultantCard } from '@/components/consultants/ConsultantCard'
import { ConsultantSearchFilters } from '@/components/consultants/ConsultantSearchFilters'
import { useThrottle } from '@/lib/hooks/useThrottle'

const categories = ['healthcare', 'legal', 'finance', 'tech', 'mental_health', 'business', 'education', 'fitness']

const steps = [
  {
    icon: <Users size={32} />,
    title: 'Choose Consultant',
    desc: 'Browse profiles, read reviews, and select the perfect expert for your needs.',
  },
  {
    icon: <Clock size={32} />,
    title: 'Pay Only for Time',
    desc: 'Wallet-based billing ensures you only pay for the exact seconds you consult.',
  },
]

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  )

  const { data: allConsultants, isLoading } = useListConsultantsQuery({
    limit: 100,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    sort_by: 'rating',
    order: 'desc',
    is_online: true,
  })

  const filteredConsultants = useMemo(() => {
    if (!allConsultants) return []
    return allConsultants
  }, [allConsultants])

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search)
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category)
    const params = new URLSearchParams(searchParams)
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  const handleChatClick = useCallback((consultantId: string) => {
    if (isAuthenticated) {
      router.push(`/client/consultants/${consultantId}`)
    } else {
      router.push('/register')
    }
  }, [isAuthenticated, router])

  const throttledChatClick = useThrottle(handleChatClick, 1000)

  const showWelcome = isAuthenticated && user

  // Show skeleton loaders while loading
  if (isLoading && !allConsultants) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8">
            <div className="h-10 w-64 bg-surface-variant rounded animate-pulse" />
            <div className="h-5 w-96 bg-surface-variant rounded mt-2 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-surface-variant" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-surface-variant rounded mb-1" />
                    <div className="h-3 w-16 bg-surface-variant rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-surface-variant rounded mb-2" />
                <div className="h-3 w-32 bg-surface-variant rounded mb-3" />
                <div className="h-9 w-full bg-surface-variant rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          {showWelcome ? (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">
                Welcome, {user.first_name}! 👋
              </h1>
              <p className="text-on-surface-variant">
                Find experts to consult with.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">
                Find Your Expert
              </h1>
              <p className="text-on-surface-variant">
                Connect with verified professionals across multiple domains
              </p>
            </>
          )}
        </div>

        <ConsultantSearchFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onSearch={handleSearch}
          searchValue={searchTerm}
        />

        {filteredConsultants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant text-lg">No online consultants available</p>
            {selectedCategory && (
              <button
                onClick={() => handleCategorySelect(null)}
                className="mt-4 text-primary hover:underline"
              >
                Clear category filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 text-sm text-on-surface-variant">
              Showing {filteredConsultants.length} online consultants
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {filteredConsultants.map((consultant, index) => (
                <ConsultantCard
                  key={consultant.id}
                  consultant={consultant}
                  index={index}
                  isAuthenticated={isAuthenticated}
                  onChatClick={throttledChatClick}
                />
              ))}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It <span className="gradient-text">Works</span>
              </h2>
              <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center border border-primary/20 text-primary mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}