'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Users, ChevronRight, Bell, Wallet, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { IncomingRequestCard } from '@/components/consultations/IncomingRequestCard'
import {
  useGetIncomingRequestsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useGetMyConsultationsQuery,
} from '@/lib/api/consultation'
import { useGetWalletBalanceQuery } from '@/lib/api/wallet'
import { formatPrice } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

export default function ConsultantDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const { data: incomingRequests, isLoading: incomingLoading, refetch: refetchIncoming } =
    useGetIncomingRequestsQuery(undefined, {
      skip: !isAuthenticated || user?.role !== 'consultant',
    })

  const { data: allConsultations, isLoading: consultationsLoading } =
    useGetMyConsultationsQuery({ limit: 100 }, {
      skip: !isAuthenticated || user?.role !== 'consultant',
    })

  const { data: walletData } = useGetWalletBalanceQuery(undefined, {
    skip: !isAuthenticated,
  })

  const [acceptConsultation] = useAcceptConsultationMutation()
  const [rejectConsultation] = useRejectConsultationMutation()
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!authLoading && isAuthenticated && user?.role !== 'consultant') {
      router.push('/client/dashboard')
    }
  }, [authLoading, isAuthenticated, user, router])

  const handleAccept = async (id: string) => {
    setProcessingId(id)
    try {
      await acceptConsultation(id).unwrap()
      toast.success('Consultation accepted!')
      await refetchIncoming()
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
      await refetchIncoming()
    } catch (error: any) {
      toast.error(error?.data?.detail || 'Failed to reject')
    } finally {
      setProcessingId(null)
    }
  }

  if (authLoading || incomingLoading || consultationsLoading) {
    return <LoadingSpinner />
  }

  const totalEarnings = walletData?.balance || 0
  const totalClients = new Set(allConsultations?.map(c => c.client_id) || []).size
  const totalConsultations = allConsultations?.length || 0
  const averageRating = 0

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-on-surface">
                Welcome back, {user?.first_name}
              </h1>
              <p className="text-on-surface-variant">Manage your consultations and clients</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{incomingRequests?.length || 0}</p>
                  <p className="text-xs text-on-surface-variant">Incoming</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-tertiary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{totalClients}</p>
                  <p className="text-xs text-on-surface-variant">Clients</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{totalConsultations}</p>
                  <p className="text-xs text-on-surface-variant">Total</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{averageRating.toFixed(1)}</p>
                  <p className="text-xs text-on-surface-variant">Rating</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{formatPrice(totalEarnings)}</p>
                  <p className="text-xs text-on-surface-variant">Earnings</p>
                </div>
              </div>
            </div>
          </div>

          {incomingRequests && incomingRequests.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-on-surface">Incoming Requests</h2>
                <button
                  onClick={() => router.push('/consultations')}
                  className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                {incomingRequests.map((request) => {
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
          ) : (
            <div className="glass-card p-12 rounded-xl text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-outline" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">No Incoming Requests</h3>
              <p className="text-on-surface-variant text-sm">
                When clients request a consultation, you'll see them here.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}