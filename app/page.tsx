'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Users, Clock, User, Zap } from 'lucide-react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { useListConsultantsQuery } from '@/lib/api/consultant'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils/utils'
import ConsultantsPage from "@/app/client/consultants/page";

const steps = [
  {
    icon: <Users size={32} />,
    title: 'Choose Consultant',
    desc: 'Browse profiles, read reviews, and select the perfect expert for your needs.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Start Chatting',
    desc: 'Connect instantly via high-quality chat with end-to-end encryption.',
  },
  {
    icon: <Clock size={32} />,
    title: 'Pay Only for Time',
    desc: 'Wallet-based billing ensures you only pay for the exact seconds you consult.',
  },
]

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { data: consultants, isLoading } = useListConsultantsQuery({
    limit: 100,
    sort_by: 'rating',
    order: 'desc',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-card p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-surface-variant" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-surface-variant rounded mb-1" />
                    <div className="h-3 w-16 bg-surface-variant rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-surface-variant rounded mb-2" />
                <div className="h-3 w-32 bg-surface-variant rounded mb-3" />
                <div className="h-9 w-full bg-surface-variant rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  

  const totalConsultants = consultants?.length || 0
  const displayConsultants = consultants || []

  const handleChatClick = (consultantId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAuthenticated) {
      router.push(`/client/consultants/${consultantId}`)
    } else {
      router.push('/register')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
<ConsultantsPage/>
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Consultants Section with View All Button */}
      {/*  <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-on-surface">Consultants</h2>
          <Link href="/client/consultants">
            <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All →
            </button>
          </Link>
        </div>
*/}
        {/* Mobile: 2 cards per row + horizontal scrollable */}
       {/* <div className="lg:hidden overflow-x-auto hide-scrollbar pb-4">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {displayConsultants.map((consultant, index) => (
              <motion.div
                key={consultant.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="w-[160px] glass-card p-3 rounded-xl hover:bg-surface-variant/50 transition-all duration-300 group cursor-pointer shrink-0"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push(`/client/consultants/${consultant.id}`)
                  } else {
                    router.push('/register')
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                    {consultant.avatar_url ? (
                      <img
                        src={consultant.avatar_url}
                        alt={`${consultant.first_name} ${consultant.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-on-surface truncate">
                      {consultant.first_name} {consultant.last_name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {consultant.specialization_name || consultant.category || 'Expert'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-semibold text-on-surface">
                      {consultant.average_rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      ({consultant.total_reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-on-surface">
                      {formatPrice(consultant.per_minute_fee)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">/min</span>
                  </div>
                </div>

                {consultant.bio && (
                  <p className="text-[10px] text-on-surface-variant line-clamp-2 mb-2">
                    {consultant.bio}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium ${consultant.is_online ? 'text-tertiary' : 'text-outline'}`}>
                    {consultant.is_online ? '● Online' : '● Offline'}
                  </span>
                  <button
                    onClick={(e) => handleChatClick(consultant.id, e)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                      consultant.is_online
                        ? 'bg-primary text-on-primary hover:opacity-90'
                        : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                    }`}
                    disabled={!consultant.is_online}
                  >
                    Chat
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
/*}
        {/* Desktop: Grid */}
       {/* <div className="hidden lg:grid grid-cols-4 gap-4">
          {displayConsultants.map((consultant, index) => (
            <motion.div
              key={consultant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-card p-4 rounded-xl hover:bg-surface-variant/50 transition-all duration-300 group cursor-pointer"
              onClick={() => {
                if (isAuthenticated) {
                  router.push(`/client/consultants/${consultant.id}`)
                } else {
                  router.push('/register')
                }
              }}
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
                  <span className="text-sm font-semibold text-on-surface">
                    {consultant.average_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    ({consultant.total_reviews})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-bold text-on-surface">
                    {formatPrice(consultant.per_minute_fee)}
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
                <span className={`text-xs font-medium ${consultant.is_online ? 'text-tertiary' : 'text-outline'}`}>
                  {consultant.is_online ? '● Online' : '● Offline'}
                </span>
                <button
                  onClick={(e) => handleChatClick(consultant.id, e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    consultant.is_online
                      ? 'bg-primary text-on-primary hover:opacity-90'
                      : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
                  disabled={!consultant.is_online}
                >
                  Chat
                </button>
              </div>
            </motion.div>
          ))}
        </div>
*/}
        {/* Stats Section */}
        {!isAuthenticated ? (
        <div className="my-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-xl text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {totalConsultants}+
              </div>
              <div className="text-sm text-on-surface-variant mt-1">Verified Consultants</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-xl text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">98%</div>
              <div className="text-sm text-on-surface-variant mt-1">Customer Satisfaction</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-xl text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-on-surface-variant mt-1">Availability</div>
            </motion.div>
          </div>
        </div>
  ):(<div> </div>)}
        {/* How It Works Section */}
        {!isAuthenticated ? (

        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center border border-primary/20 text-primary mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-on-surface-variant text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        ):(<div> </div>)}
      
      </main>

      <Footer />
    </div>
  )
}