'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetMyConsultationsQuery } from '@/lib/api/consultation'
import { useListConsultantsQuery } from '@/lib/api/consultant'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { ConsultationFilters } from '@/components/consultations/ConsultationFilters'
import { ConsultationDetailModal } from '@/components/consultations/ConsultationDetailModal'
import { formatDate, formatTime, formatPrice } from '@/lib/utils/utils'

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    requested: { color: 'bg-yellow-500/20 text-yellow-500', label: 'Requested' },
    accepted: { color: 'bg-blue-500/20 text-blue-500', label: 'Accepted' },
    in_progress: { color: 'bg-green-500/20 text-green-500', label: 'In Progress' },
    completed: { color: 'bg-green-500/20 text-green-500', label: 'Completed' },
    rejected: { color: 'bg-red-500/20 text-red-500', label: 'Rejected' },
    expired: { color: 'bg-gray-500/20 text-gray-500', label: 'Expired' },
    disputed: { color: 'bg-red-500/20 text-red-500', label: 'Disputed' },
    refunded: { color: 'bg-orange-500/20 text-orange-500', label: 'Refunded' },
  }

  const config = statusConfig[status] || statusConfig.requested

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export default function ConsultationsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isClient = user?.role === 'client'
  const isConsultant = user?.role === 'consultant'

  const { data: consultations, isLoading: consultationsLoading, refetch } =
    useGetMyConsultationsQuery({ limit: 100 })

  const { data: allConsultants, isLoading: consultantsLoading } = useListConsultantsQuery({
    limit: 100,
  })

  const consultantMap: Record<string, any> = {}
  allConsultants?.forEach((c: any) => {
    consultantMap[c.user_id] = c
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const statusOptions = [
    'requested',
    'accepted',
    'in_progress',
    'completed',
    'rejected',
    'expired',
    'disputed',
    'refunded',
  ]

  const filteredConsultations = useMemo(() => {
    if (!consultations) return []

    return consultations.filter(c => {
      const otherUser = isClient 
        ? consultantMap[c.consultant_id]
        : c.client

      const otherName = otherUser 
        ? `${otherUser.first_name} ${otherUser.last_name}` 
        : ''

      const matchesSearch = otherName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter

      let matchesDate = true
      if (dateRange !== 'all') {
        const created = new Date(c.created_at)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        switch (dateRange) {
          case 'today':
            matchesDate = created >= today
            break
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            matchesDate = created >= weekAgo
            break
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            matchesDate = created >= monthAgo
            break
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [consultations, searchQuery, statusFilter, dateRange, isClient, consultantMap])

  const handleApplyFilters = (filters: any) => {
    setSearchQuery(filters.search)
    setStatusFilter(filters.status)
    setDateRange(filters.dateRange)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateRange('all')
  }

  const handleRowClick = (consultation: any) => {
    setSelectedConsultation(consultation)
    setIsModalOpen(true)
  }

  const handleViewChat = () => {
    if (!selectedConsultation) return
    const otherId = isClient 
      ? selectedConsultation.consultant_id 
      : selectedConsultation.client_id
    if (otherId) {
      router.push(`/chat?consultant=${otherId}`)
    }
    setIsModalOpen(false)
  }

  if (authLoading || consultationsLoading || consultantsLoading) {
    return <LoadingSpinner />
  }

  const otherUserMap = useMemo(() => {
    const map: Record<string, any> = {}
    consultations?.forEach(c => {
      if (isClient) {
        map[c.id] = consultantMap[c.consultant_id] || null
      } else {
        map[c.id] = c.client || null
      }
    })
    return map
  }, [consultations, isClient, consultantMap])

  const selectedOtherUser = selectedConsultation ? otherUserMap[selectedConsultation.id] : null

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">
            {isClient ? 'All Consultations' : 'All Requests'}
          </h1>
          <p className="text-on-surface-variant">
            {isClient ? 'View all your consultation history' : 'Manage all your consultation requests'}
          </p>
        </div>
        <Button
          onClick={() => router.push(isClient ? '/client/dashboard' : '/consultant/dashboard')}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <ConsultationFilters
        filters={{
          search: searchQuery,
          status: statusFilter,
          dateRange: dateRange,
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        statusOptions={statusOptions}
        role={isClient ? 'client' : 'consultant'}
      />

      <div className="glass-card rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low">
              <tr className="text-left text-on-surface-variant">
                <th className="px-4 py-3 font-medium">
                  {isClient ? 'Consultant' : 'Client'}
                </th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                    No consultations found
                  </td>
                </tr>
              ) : (
                filteredConsultations.map((c, index) => {
                  const otherUser = isClient 
                    ? consultantMap[c.consultant_id]
                    : c.client
                  
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleRowClick(c)}
                      className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                            {otherUser?.avatar_url ? (
                              <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-on-surface-variant" />
                            )}
                          </div>
                          <span className="font-medium text-on-surface truncate max-w-[150px]">
                            {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {c.requested_minutes}m
                      </td>
                      <td className="px-4 py-3 font-medium text-on-surface">
                        {formatPrice(c.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-primary text-xs">
                        View →
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConsultationDetailModal
        consultation={selectedConsultation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        otherUser={selectedOtherUser}
        userRole={isClient ? 'client' : 'consultant'}
        onViewChat={handleViewChat}
      />
    </div>
  )
}