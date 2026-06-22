'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Zap, Calendar, Clock, User, ArrowLeft, MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetConsultantQuery } from '@/lib/api/consultant'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatPrice } from '@/lib/utils/utils'

export default function ConsultantProfilePage() {
  const router = useRouter()
  const params = useParams()
  const consultantId = params.id as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [isBooking, setIsBooking] = useState(false)

  const { data: consultant, isLoading: consultantLoading } = useGetConsultantQuery(
    consultantId,
    { skip: !consultantId }
  )
{/*
  // useEffect(() => {
  //   if (!authLoading && !isAuthenticated) {
  //     router.push('/register')
  //   }
  // }, [authLoading, isAuthenticated,router])
*/}
  if (authLoading || consultantLoading) {
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

  const totalCost = selectedMinutes * consultant.per_minute_fee

  const handleStartConsultation = async () => {
    setIsBooking(true)
    try {
      // API call will be made here
      // await requestConsultation({ consultant_id: consultantId, requested_minutes: selectedMinutes })
      // Redirect to chat or consultation page
      router.push(`/client/consultations`)
    } catch (error) {
      console.error(error)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Consultant Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info - 2/3 */}
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
                    <div className="flex items-center gap-4 mt-2">
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
                      <p className="mt-4 text-sm text-on-surface-variant">{consultant.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Card - 1/3 */}
            <div>
              <div className="glass-card p-6 rounded-xl sticky top-24">
                <h3 className="font-bold text-on-surface mb-4">Start Consultation</h3>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-on-surface-variant">Rate</span>
                  <span className="font-bold text-on-surface">
                    {formatPrice(consultant.per_minute_fee)}/min
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-on-surface-variant mb-2">
                    Minutes
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setSelectedMinutes(mins)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedMinutes === mins
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-outline-variant/30">
                  <span className="text-sm font-semibold text-on-surface">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(totalCost)}
                  </span>
                </div>

                <button
                  onClick={handleStartConsultation}
                  disabled={!consultant.is_online || isBooking}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    consultant.is_online && !isBooking
                      ? 'bg-primary text-on-primary hover:opacity-90'
                      : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
                >
                  {isBooking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : consultant.is_online ? (
                    'Start Consultation'
                  ) : (
                    'Offline'
                  )}
                </button>

                {!consultant.is_online && (
                  <p className="text-xs text-center text-on-surface-variant mt-2">
                    Consultant is currently offline
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}