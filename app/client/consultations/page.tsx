'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DashboardSidebar } from '@/components/client/DashboardSidebar'
import { WalletSidebar } from '@/components/client/WalletSidebar'
import { EditProfileModal } from '@/components/client/EditProfileModal'
import { formatPrice, formatDate } from '@/lib/utils/utils'

const statusOptions = ['All', 'Requested', 'Accepted', 'In Progress', 'Completed', 'Cancelled', 'Expired', 'Disputed', 'Refunded']
const statusColors: Record<string, string> = {
  All: 'bg-surface-variant text-on-surface-variant',
  Requested: 'bg-primary/20 text-primary',
  Accepted: 'bg-secondary/20 text-secondary',
  'In Progress': 'bg-secondary/20 text-secondary',
  Completed: 'bg-tertiary/20 text-tertiary',
  Cancelled: 'bg-error/20 text-error',
  Expired: 'bg-error/20 text-error',
  Disputed: 'bg-error/20 text-error',
  Refunded: 'bg-error/20 text-error',
}

const mockConsultations = [
  { id: '1', consultant_name: 'Dr. Sarah K.', consultant_avatar: '', date: '2026-10-12T14:30:00', duration: 45, amount: 2700, status: 'Completed' },
  { id: '2', consultant_name: 'Marcus Chen', consultant_avatar: '', date: '2026-10-11T10:15:00', duration: 60, amount: 5100, status: 'Completed' },
  { id: '3', consultant_name: 'Elena Rodriguez', consultant_avatar: '', date: '2026-10-10T16:45:00', duration: 30, amount: 3600, status: 'In Progress' },
  { id: '4', consultant_name: 'James Wilson', consultant_avatar: '', date: '2026-10-08T11:00:00', duration: 0, amount: 0, status: 'Cancelled' },
  { id: '5', consultant_name: 'Dr. Anjali Sharma', consultant_avatar: '', date: '2026-10-07T09:30:00', duration: 50, amount: 3000, status: 'Completed' },
  { id: '6', consultant_name: 'Robert Kim', consultant_avatar: '', date: '2026-10-05T14:00:00', duration: 25, amount: 1250, status: 'Disputed' },
]

export default function ConsultationsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
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

  if (isLoading) return <LoadingSpinner />

  const filtered = mockConsultations.filter(c => {
    const matchesSearch = c.consultant_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <DashboardSidebar onWalletClick={() => setIsWalletOpen(true)} />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-12 lg:ml-[260px]">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface">Consultations</h1>
            <p className="text-on-surface-variant">View all your consultation history</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by consultant name..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface appearance-none focus:outline-none focus:border-primary transition-colors"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr className="text-left text-on-surface-variant">
                    <th className="px-4 py-3 font-medium">Consultant</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Date & Time</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-on-surface-variant">No consultations found</td>
                    </tr>
                  ) : (
                    filtered.map((c, index) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => router.push(`/client/consultations/${c.id}`)}
                        className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-medium text-on-surface">{c.consultant_name}</td>
                        <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                          {formatDate(c.date)} • {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{c.duration}m</td>
                        <td className="px-4 py-3 font-medium text-on-surface">{formatPrice(c.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || 'bg-surface-variant text-on-surface-variant'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-primary text-xs">View →</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <WalletSidebar isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} balance={14250} transactions={[]} />
      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <Footer />
    </div>
  )
}