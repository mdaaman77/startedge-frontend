'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, User, Star, Zap } from 'lucide-react'

import { useListConsultantsQuery } from '@/lib/api/consultant'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DashboardSidebar } from '@/components/client/DashboardSidebar'
import { WalletSidebar } from '@/components/client/WalletSidebar'
import { EditProfileModal } from '@/components/client/EditProfileModal'
import { formatPrice } from '@/lib/utils/utils'

type Consultant = {
  id: string
  first_name: string
  last_name: string
  specialization_name?: string
  category?: string
  average_rating: number
  total_reviews: number
  per_minute_fee: number
  experience_years?: number
  is_online: boolean
  avatar_url?: string
  bio?: string
}

const sortOptions = [
  'Rating (High to Low)',
  'Rating (Low to High)',
  'Fee (Low to High)',
  'Fee (High to Low)',
  'Experience (High to Low)',
]

export default function ConsultantsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState(sortOptions[0])
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const today = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date())
  }, [])

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileModalOpen(true)
    document.addEventListener('openEditProfile', handleOpenProfile)
    return () => document.removeEventListener('openEditProfile', handleOpenProfile)
  }, [])

  const { data, isLoading } = useListConsultantsQuery({
    limit: 100,
    sort_by: 'rating',
    order: 'desc',
  })

  const consultants: Consultant[] = data ?? []

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/client/consultants/${id}`)
    },
    [router]
  )

  const handleChatClick = useCallback(
    (e: React.MouseEvent, id: string, isOnline: boolean) => {
      e.stopPropagation()
      if (!isOnline) return
      router.push(`/client/consultants/${id}`)
    },
    [router]
  )

  const processedConsultants = useMemo(() => {
    const searchLower = search.toLowerCase()

    const filtered = consultants.filter((c) => {
      const name = `${c.first_name} ${c.last_name}`.toLowerCase()
      return (
        name.includes(searchLower) ||
        c.specialization_name?.toLowerCase().includes(searchLower) ||
        c.category?.toLowerCase().includes(searchLower)
      )
    })

    const sorted = filtered.sort((a, b) => {
      const ratingA = a.average_rating ?? 0
      const ratingB = b.average_rating ?? 0
      const feeA = a.per_minute_fee ?? 0
      const feeB = b.per_minute_fee ?? 0
      const expA = a.experience_years ?? 0
      const expB = b.experience_years ?? 0

      switch (sortBy) {
        case 'Rating (High to Low)': return ratingB - ratingA
        case 'Rating (Low to High)': return ratingA - ratingB
        case 'Fee (Low to High)': return feeA - feeB
        case 'Fee (High to Low)': return feeB - feeA
        case 'Experience (High to Low)': return expB - expA
        default: return 0
      }
    })

    return sorted.sort((a, b) => Number(b.is_online) - Number(a.is_online))
  }, [consultants, search, sortBy])

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="flex">
        <DashboardSidebar onWalletClick={() => setIsWalletOpen(true)} />

        <main className="flex-1 container mx-auto px-4 pt-24 pb-12 lg:ml-[260px]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            {user ? (
              <>
                <h1 className="text-3xl font-bold text-on-surface">
                  Welcome, {user?.first_name ?? 'Aditya'}
                </h1>
                <p className="text-on-surface-variant">
                  {today}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-on-surface">
                  Consultants
                </h1>
                <p className="text-on-surface-variant">
                  Browse verified experts across domains
                </p>
              </>
            )}
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialization, or category..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>

            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface appearance-none focus:outline-none focus:border-primary"
              >
                {sortOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            </div>
          </div>

          {/* Results */}
          {processedConsultants.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              No consultants found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedConsultants.map((consultant, index) => (
                <motion.div
                  key={consultant.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  onClick={() => handleCardClick(consultant.id)}
                  className="glass-card p-4 rounded-xl hover:bg-surface-variant/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                      {consultant.avatar_url ? (
                        <img
                          src={consultant.avatar_url}
                          alt={`${consultant.first_name} ${consultant.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-on-surface-variant" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {consultant.first_name} {consultant.last_name}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {consultant.specialization_name || consultant.category || 'Expert'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-semibold">
                        {(consultant.average_rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        ({consultant.total_reviews ?? 0})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold">
                        {formatPrice(consultant.per_minute_fee ?? 0)}
                      </span>
                      <span className="text-xs text-on-surface-variant">/min</span>
                    </div>
                  </div>

                  {consultant.bio && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                      {consultant.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        consultant.is_online ? 'text-tertiary' : 'text-outline'
                      }`}
                    >
                      {consultant.is_online ? '● Online' : '● Offline'}
                    </span>

                    <button
                      disabled={!consultant.is_online}
                      onClick={(e) =>
                        handleChatClick(e, consultant.id, consultant.is_online)
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        consultant.is_online
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                      }`}
                    >
                      {consultant.is_online ? 'Chat Now' : 'Offline'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      <WalletSidebar
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={14250}
        transactions={[]}
      />

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}