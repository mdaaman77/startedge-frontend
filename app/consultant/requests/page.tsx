'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, User, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { IncomingRequestCard } from '@/components/consultations/IncomingRequestCard'
import {
  useGetIncomingRequestsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
} from '@/lib/api/consultation'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

export default function ConsultantRequestsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const { data: incomingRequests, isLoading, refetch } = useGetIncomingRequestsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'consultant',
  })

  const [acceptConsultation] = useAcceptConsultationMutation()
  const [rejectConsultation] = useRejectConsultationMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && mounted) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      if (user?.role !== 'consultant') {
        router.push('/')
        return
      }
    }
  }, [authLoading, mounted, isAuthenticated, user, router])

  const handleAccept = async (id: string) => {
    setProcessingId(id)
    try {
      const result = await acceptConsultation(id).unwrap()
      toast.success('Consultation accepted!')
      await refetch()
      
      // ✅ Redirect to chat with the client
      if (result && result.client_id) {
        router.push(`/chat?consultant=${result.client_id}`)
      } else {
        router.push('/chat')
      }
    } catch (error: any) {
      toast.error(error?.data?.detail || 'Failed to accept')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      await rejectConsultation(id).unwrap()
      toast.success('Consultation rejected')
      await refetch()
    } catch (error: any) {
      toast.error(error?.data?.detail || 'Failed to reject')
    } finally {
      setProcessingId(null)
    }
  }

  if (!mounted || authLoading || isLoading) {
    return <LoadingSpinner />
  }

  const activeRequests = incomingRequests?.filter(r => r.status === 'requested') || []
  const expiredRequests = incomingRequests?.filter(r => r.status === 'expired' || r.status === 'rejected') || []

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => router.push('/consultant/dashboard')}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-2"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-on-surface">Incoming Requests</h1>
              <p className="text-on-surface-variant">
                Review and respond to consultation requests from clients
              </p>
            </div>
            <div className="text-sm text-on-surface-variant">
              {activeRequests.length} pending
            </div>
          </div>

          {activeRequests.length === 0 && expiredRequests.length === 0 ? (
            <div className="glass-card p-12 rounded-xl text-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-outline" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">No Requests</h3>
              <p className="text-on-surface-variant text-sm">
                You don't have any consultation requests at the moment.
              </p>
            </div>
          ) : (
            <>
              {activeRequests.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-on-surface mb-4">Active Requests</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeRequests.map((request) => {
                      const clientName = request.client?.first_name 
                        ? `${request.client.first_name} ${request.client.last_name}`
                        : `Client ${request.client_id.slice(0, 8)}`
                      
                      return (
                        <IncomingRequestCard
                          key={request.id}
                          id={request.id}
                          clientName={clientName}
                          clientAvatar={request.client?.avatar_url}
                          requestedMinutes={request.requested_minutes}
                          perMinuteRate={request.per_minute_rate}
                          totalAmount={request.total_amount}
                          reason={request.issue_reason}
                          createdAt={request.created_at}
                          onAccept={handleAccept}
                          onReject={handleReject}
                          isProcessing={processingId === request.id}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {expiredRequests.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-on-surface mb-4">Expired / Rejected</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {expiredRequests.map((request) => {
                      const clientName = request.client?.first_name 
                        ? `${request.client.first_name} ${request.client.last_name}`
                        : `Client ${request.client_id.slice(0, 8)}`
                      
                      return (
                        <div key={request.id} className="glass-card p-4 rounded-xl opacity-60">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                              {request.client?.avatar_url ? (
                                <img src={request.client.avatar_url} alt={clientName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-on-surface-variant" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-on-surface truncate">{clientName}</p>
                              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                <span>{request.requested_minutes}m</span>
                                <span>•</span>
                                <span>{formatPrice(request.per_minute_rate)}/min</span>
                              </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              request.status === 'expired' 
                                ? 'bg-gray-500/20 text-gray-500' 
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {request.status === 'expired' ? 'Expired' : 'Rejected'}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-outline-variant/30">
                            <p className="text-sm font-bold text-primary">{formatPrice(request.total_amount)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}