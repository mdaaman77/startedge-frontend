'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Clock, User, ArrowLeft, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetConsultantQuery } from '@/lib/api/consultant'
import { useRequestConsultationMutation, useGetMyConsultationsQuery, useExpireConsultationMutation } from '@/lib/api/consultation'
import { useGetWalletBalanceQuery } from '@/lib/api/wallet'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BookingCard } from '@/components/consultations/BookingCard'
import { ConfirmationModal } from '@/components/consultations/ConfirmationModal'
import { TimerBanner } from '@/components/consultations/TimerBanner'
import { formatPrice } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

type ConsultationStatus = 'idle' | 'requested' | 'accepted' | 'rejected' | 'expired'

export default function ConsultantProfilePage() {
  const router = useRouter()
  const params = useParams()
  const consultantId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [bookingMinutes, setBookingMinutes] = useState(15)
  const [consultationStatus, setConsultationStatus] = useState<ConsultationStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(120)
  const [isBooking, setIsBooking] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { data: consultant, isLoading: consultantLoading } = useGetConsultantQuery(
    consultantId,
    { skip: !consultantId }
  )

  const { data: myConsultations, refetch: refetchConsultations, isLoading: consultationsLoading } = useGetMyConsultationsQuery(
    { limit: 50 },
    { skip: !isAuthenticated }
  )

  const { data: walletData, refetch: refetchWallet } = useGetWalletBalanceQuery(undefined, {
    skip: !isAuthenticated,
  })

  const [requestConsultation] = useRequestConsultationMutation()
  const [expireConsultation] = useExpireConsultationMutation()

  // Check if there's an active or pending consultation with this consultant
  const hasActiveOrPendingConsultation = useMemo(() => {
    if (!myConsultations || !consultantId) return false
    return myConsultations.some(
      c => c.consultant_id === consultantId &&
        ['requested', 'accepted', 'in_progress'].includes(c.status)
    )
  }, [myConsultations, consultantId])

  const isConsultationRequested = consultationStatus === 'requested'

  // Check for existing pending consultation on mount
  useEffect(() => {
    if (myConsultations && consultantId) {
      const existing = myConsultations.find(
        c => c.consultant_id === consultantId && c.status === 'requested'
      )
      if (existing) {
        const created = new Date(existing.created_at)
        const elapsed = Math.floor((Date.now() - created.getTime()) / 1000)
        const remaining = Math.max(0, 120 - elapsed)
        
        if (remaining > 0) {
          setConsultationStatus('requested')
          setConsultationId(existing.id)
          setTimeLeft(remaining)
          startPolling()
        } else {
          // Already expired - update status in DB
          setConsultationStatus('expired')
          expireConsultation(existing.id).catch(console.error)
        }
      }
    }
  }, [myConsultations, consultantId])

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const startPolling = () => {
    stopPolling()
    if (!isAuthenticated || !consultantId) return

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const result = await refetchConsultations()
        const consultations = result.data || []
        const matching = consultations.filter(c => c.consultant_id === consultantId)
        const found = matching.find(c => c.id === consultationId)

        if (found) {
          if (found.status === 'accepted') {
            setConsultationStatus('accepted')
            stopPolling()
            toast.success('Consultation accepted!')
            setTimeout(() => {
              router.push(`/chat?consultant=${consultantId}`)
            }, 1500)
            return
          }
          if (found.status === 'rejected') {
            setConsultationStatus('rejected')
            stopPolling()
            toast.error('Consultation rejected by consultant')
            return
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000)
  }

  // Timer countdown
  useEffect(() => {
    if (consultationStatus === 'requested' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Expire the consultation
            if (consultationId) {
              expireConsultation(consultationId).catch(console.error)
            }
            setConsultationStatus('expired')
            stopPolling()
            toast.error('Consultation request expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [consultationStatus, timeLeft, consultationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const handleBookNow = (minutes: number) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'client') {
      toast.error('Only clients can book consultations')
      return
    }
    if (!consultant?.is_online) {
      toast.error('Consultant is currently offline')
      return
    }
    if (hasActiveOrPendingConsultation) {
      toast.error('You already have a consultation with this consultant')
      return
    }
    setBookingMinutes(minutes)
    setShowConfirmationModal(true)
  }

  const handleConfirmBooking = async (reason: string) => {
    if (!consultantId) return

    setIsBooking(true)
    setShowConfirmationModal(false)

    try {
      const result = await requestConsultation({
        consultant_id: consultantId,
        requested_minutes: bookingMinutes,
      }).unwrap()

      setConsultationId(result.id)
      setConsultationStatus('requested')
      setTimeLeft(120)
      toast.success('Consultation requested! Waiting for consultant to accept.')

      await refetchWallet()
      await refetchConsultations()
      startPolling()

    } catch (error: any) {
      let message = 'Failed to request consultation'
      if (error?.data?.detail) {
        if (typeof error.data.detail === 'string') {
          message = error.data.detail
        } else if (Array.isArray(error.data.detail)) {
          const details = error.data.detail.map((e: any) => e.msg || e.message || e)
          message = details.join(', ')
        }
      } else if (error?.message) {
        message = error.message
      }
      toast.error(message)
      setConsultationStatus('idle')
    } finally {
      setIsBooking(false)
    }
  }

  const handleTryAgain = () => {
    setConsultationStatus('idle')
    setTimeLeft(120)
    setConsultationId(null)
    stopPolling()
  }

  const handleDismissBanner = () => {
    setConsultationStatus('idle')
    setTimeLeft(120)
    setConsultationId(null)
    stopPolling()
  }

  if (authLoading || consultantLoading || consultationsLoading) {
    return <LoadingSpinner />
  }

  if (!consultant) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-on-surface-variant">Consultant not found</p>
        </div>
      </div>
    )
  }

  const isClient = user?.role === 'client'
  const walletBalance = walletData?.balance || 0
  const showTimerBanner = consultationStatus === 'requested' ||
    consultationStatus === 'accepted' ||
    consultationStatus === 'rejected' ||
    consultationStatus === 'expired'

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {consultationStatus === 'requested' && (
        <TimerBanner
          timeLeft={timeLeft}
          status="waiting"
          consultantName={`${consultant.first_name} ${consultant.last_name}`}
        />
      )}

      {consultationStatus === 'accepted' && (
        <TimerBanner
          timeLeft={0}
          status="accepted"
          consultantName={`${consultant.first_name} ${consultant.last_name}`}
        />
      )}

      {(consultationStatus === 'rejected' || consultationStatus === 'expired') && (
        <TimerBanner
          timeLeft={0}
          status={consultationStatus}
          consultantName={`${consultant.first_name} ${consultant.last_name}`}
          onClose={handleDismissBanner}
        />
      )}

      <main className={`container mx-auto px-4 ${showTimerBanner ? 'pt-32' : 'pt-24'} pb-12`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                    {consultant.avatar_url ? (
                      <img
                        src={consultant.avatar_url}
                        alt={`${consultant.first_name} ${consultant.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-on-surface">
                      {consultant.first_name} {consultant.last_name}
                    </h1>
                    <p className="text-on-surface-variant">
                      {consultant.specialization_name || consultant.category || 'Expert'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">
                          {consultant.average_rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          ({consultant.total_reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-on-surface-variant">
                          {consultant.experience_years || 0} years experience
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm text-on-surface-variant">
                          {formatPrice(consultant.per_minute_fee)}/min
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`text-sm font-medium ${
                          consultant.is_online ? 'text-tertiary' : 'text-outline'
                        }`}
                      >
                        {consultant.is_online ? '● Online' : '● Offline'}
                      </span>
                    </div>
                    {consultant.bio && (
                      <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                        {consultant.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <BookingCard
                consultantName={`${consultant.first_name} ${consultant.last_name}`}
                perMinuteFee={consultant.per_minute_fee}
                isOnline={consultant.is_online}
                isClient={isClient}
                isConsultationRequested={isConsultationRequested}
                isConsultationActive={consultationStatus === 'accepted'}
                hasActiveOrPendingConsultation={hasActiveOrPendingConsultation}
                walletBalance={walletBalance}
                onBookNow={handleBookNow}
                onTryAgain={handleTryAgain}
                cooldownSeconds={0}
                status={consultationStatus}
              />
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmBooking}
        consultantName={`${consultant.first_name} ${consultant.last_name}`}
        consultantAvatar={consultant.avatar_url}
        duration={bookingMinutes}
        totalCost={bookingMinutes * consultant.per_minute_fee}
        perMinuteFee={consultant.per_minute_fee}
        isLoading={isBooking}
      />
    </div>
  )
}