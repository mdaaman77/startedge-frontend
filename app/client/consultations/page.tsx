'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronDown, X,
  User, AlertCircle, MessageCircle, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetMyConsultationsQuery } from '@/lib/api/consultation'
import { useListConsultantsQuery } from '@/lib/api/consultant'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
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

function ConsultationDetailModal({
  consultation,
  isOpen,
  onClose,
  consultantMap,
}: {
  consultation: any
  isOpen: boolean
  onClose: () => void
  consultantMap: Record<string, any>
}) {
  const router = useRouter()
  
  if (!consultation) return null

  const consultant = consultantMap[consultation.consultant_id]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-surface-container rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-outline-variant/30 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <h2 className="text-xl font-bold text-on-surface">Consultation Details</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Status</span>
                  <StatusBadge status={consultation.status} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Consultant</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                      {consultant?.avatar_url ? (
                        <img src={consultant.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-on-surface">
                      {consultant ? `${consultant.first_name} ${consultant.last_name}` : 'Unknown Consultant'}
                    </span>
                  </div>
                </div>

                {consultant?.specialization_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Specialization</span>
                    <span className="text-sm text-on-surface">
                      {consultant.specialization_name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Requested Minutes</span>
                  <span className="text-sm text-on-surface">{consultation.requested_minutes}m</span>
                </div>

                {consultation.actual_minutes && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Actual Minutes</span>
                    <span className="text-sm text-on-surface">{consultation.actual_minutes}m</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Total Amount</span>
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(consultation.total_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Rate</span>
                  <span className="text-sm text-on-surface">
                    {formatPrice(consultation.per_minute_rate)}/min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Created</span>
                  <span className="text-sm text-on-surface">
                    {formatDate(consultation.created_at)} at {formatTime(consultation.created_at)}
                  </span>
                </div>

                {consultation.started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Started</span>
                    <span className="text-sm text-on-surface">
                      {formatDate(consultation.started_at)} at {formatTime(consultation.started_at)}
                    </span>
                  </div>
                )}

                {consultation.ended_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Ended</span>
                    <span className="text-sm text-on-surface">
                      {formatDate(consultation.ended_at)} at {formatTime(consultation.ended_at)}
                    </span>
                  </div>
                )}

                {consultation.raised_issue && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-error mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold text-sm">Issue Raised</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{consultation.issue_reason || 'No reason provided'}</p>
                    {consultation.issue_resolved_by_admin !== null && (
                      <p className="text-sm mt-2">
                        Resolved: {consultation.issue_resolved_by_admin ? '✅ Approved' : '❌ Rejected'}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                  <Button
                    onClick={() => {
                      onClose()
                      if (consultation.consultant_id) {
                        router.push(`/client/recent-consultants?consultant=${consultation.consultant_id}`)
                      }
                    }}
                    variant="gradient"
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    View Chat
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function ConsultationsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: consultations, isLoading: consultationsLoading } = useGetMyConsultationsQuery({
    limit: 100,
  })

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

  const filteredConsultations = consultations?.filter(c => {
    const consultant = consultantMap[c.consultant_id]
    const consultantName = consultant ? `${consultant.first_name} ${consultant.last_name}` : ''
    
    const matchesSearch =
      consultantName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesStatus
  }) || []

  const handleRowClick = (consultation: any) => {
    setSelectedConsultation(consultation)
    setIsModalOpen(true)
  }

  if (authLoading || consultationsLoading || consultantsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">All Consultations</h1>
          <p className="text-on-surface-variant">View all your consultation history</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by consultant name..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface appearance-none focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Status</option>
            <option value="requested">Requested</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="disputed">Disputed</option>
            <option value="refunded">Refunded</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low">
              <tr className="text-left text-on-surface-variant">
                <th className="px-4 py-3 font-medium">Consultant</th>
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
                  const consultant = consultantMap[c.consultant_id]
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
                            {consultant?.avatar_url ? (
                              <img src={consultant.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-on-surface-variant" />
                            )}
                          </div>
                          <span className="font-medium text-on-surface truncate max-w-[150px]">
                            {consultant ? `${consultant.first_name} ${consultant.last_name}` : 'Unknown'}
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
        consultantMap={consultantMap}
      />
    </div>
  )
}