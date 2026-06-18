'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, User, Star, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useListConsultantsQuery } from '@/lib/api/consultant'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DashboardSidebar } from '@/components/client/DashboardSidebar'
import { WalletSidebar } from '@/components/client/WalletSidebar'
import { EditProfileModal } from '@/components/client/EditProfileModal'
import { formatPrice } from '@/lib/utils/utils'

const sortOptions = ['Rating (High to Low)', 'Rating (Low to High)', 'Fee (Low to High)', 'Fee (High to Low)', 'Experience (High to Low)']

export default function ConsultantsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('Rating (High to Low)')
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileModalOpen(true)
    document.addEventListener('openEditProfile', handleOpenProfile)
    return () => document.removeEventListener('openEditProfile', handleOpenProfile)
  }, [])

  const { data: consultants, isLoading: consultantsLoading } = useListConsultantsQuery({
    limit: 100,
    sort_by: 'rating',
    order: 'desc',
  })

  if (isLoading || consultantsLoading) return <LoadingSpinner />

  const filtered = consultants?.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.specialization_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  ) || []

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'Rating (High to Low)': return b.average_rating - a.average_rating
      case 'Rating (Low to High)': return a.average_rating - b.average_rating
      case 'Fee (Low to High)': return a.per_minute_fee - b.per_minute_fee
      case 'Fee (High to Low)': return b.per_minute_fee - a.per_minute_fee
      case 'Experience (High to Low)': return (b.experience_years || 0) - (a.experience_years || 0)
      default: return 0
    }
  })

  const onlineFirst = [...sorted].sort((a, b) => (a.is_online === b.is_online ? 0 : a.is_online ? -1 : 1))

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <DashboardSidebar onWalletClick={() => setIsWalletOpen(true)} />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-12 lg:ml-[260px]">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface">Consultants</h1>
            <p className="text-on-surface-variant">Browse verified experts across domains</p>
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
                className="w-full pl-9 pr-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface appearance-none focus:outline-none focus:border-primary transition-colors"
              >
                {sortOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            </div>
          </div>

          {/* Results */}
          {onlineFirst.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">No consultants found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {onlineFirst.map((consultant, index) => (
                <motion.div
                  key={consultant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  onClick={() => router.push(`/client/consultants/${consultant.id}`)}
                  className="glass-card p-4 rounded-xl hover:bg-surface-variant/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                      {consultant.avatar_url ? (
                        <img src={consultant.avatar_url} alt={`${consultant.first_name} ${consultant.last_name}`} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-on-surface-variant" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-on-surface truncate">
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
                      <span className="text-sm font-semibold text-on-surface">{consultant.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-on-surface-variant">({consultant.total_reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold text-on-surface">{formatPrice(consultant.per_minute_fee)}</span>
                      <span className="text-xs text-on-surface-variant">/min</span>
                    </div>
                  </div>

                  {consultant.bio && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{consultant.bio}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${consultant.is_online ? 'text-tertiary' : 'text-outline'}`}>
                      {consultant.is_online ? '● Online' : '● Offline'}
                    </span>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        consultant.is_online
                          ? 'bg-primary text-on-primary hover:opacity-90'
                          : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                      }`}
                      disabled={!consultant.is_online}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (consultant.is_online) router.push(`/client/consultants/${consultant.id}`)
                      }}
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

      <WalletSidebar isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} balance={14250} transactions={[]} />
      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <Footer />
    </div>
  )
}