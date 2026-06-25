'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, AlertCircle, MessageCircle, Calendar, Clock } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '@/lib/utils/utils'
import { Button } from '@/components/ui/Button'

interface ConsultationDetailModalProps {
  consultation: any
  isOpen: boolean
  onClose: () => void
  otherUser: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    specialization_name?: string | null
  } | null
  userRole: 'client' | 'consultant'
  onViewChat?: () => void
}

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

export function ConsultationDetailModal({
  consultation,
  isOpen,
  onClose,
  otherUser,
  userRole,
  onViewChat,
}: ConsultationDetailModalProps) {
  if (!consultation) return null

  const isClient = userRole === 'client'
  const otherPerson = otherUser

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
                  <span className="text-sm text-on-surface-variant">
                    {isClient ? 'Consultant' : 'Client'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                      {otherPerson?.avatar_url ? (
                        <img src={otherPerson.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-on-surface">
                      {otherPerson ? `${otherPerson.first_name} ${otherPerson.last_name}` : 'Unknown'}
                    </span>
                  </div>
                </div>

                {otherPerson?.specialization_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Specialization</span>
                    <span className="text-sm text-on-surface">
                      {otherPerson.specialization_name}
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
                  <span className="text-sm text-on-surface-variant flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created
                  </span>
                  <span className="text-sm text-on-surface">
                    {formatDate(consultation.created_at)} at {formatTime(consultation.created_at)}
                  </span>
                </div>

                {consultation.started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Started
                    </span>
                    <span className="text-sm text-on-surface">
                      {formatDate(consultation.started_at)} at {formatTime(consultation.started_at)}
                    </span>
                  </div>
                )}

                {consultation.ended_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ended
                    </span>
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
                    onClick={onViewChat}
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