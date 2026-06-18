'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Star, Zap, ArrowRight } from 'lucide-react'
import { Consultant } from '@/lib/api/consultant'
import { formatPrice } from '@/lib/utils/utils'

interface AvailableConsultantsProps {
  consultants: Consultant[]
  limit?: number
}

export function AvailableConsultants({ consultants, limit = 4 }: AvailableConsultantsProps) {
  const displayConsultants = consultants?.slice(0, limit) || []

  if (displayConsultants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-on-surface-variant">No consultants available at the moment.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
        {displayConsultants.map((consultant, index) => (
          <motion.div
            key={consultant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="min-w-[240px] max-w-[240px] glass-card p-4 rounded-xl hover:bg-surface-variant/50 transition-all duration-300 group"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                {consultant.avatar_url ? (
                  <img src={consultant.avatar_url} alt={`${consultant.first_name} ${consultant.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-on-surface-variant" />
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

            {/* Rating + Fee */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-semibold text-on-surface">
                  {consultant.average_rating.toFixed(1)}
                </span>
                <span className="text-xs text-on-surface-variant">({consultant.total_reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-bold text-on-surface">{formatPrice(consultant.per_minute_fee)}</span>
                <span className="text-xs text-on-surface-variant">/min</span>
              </div>
            </div>

            {/* Bio - 2 lines with line-clamp */}
            {consultant.bio && (
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                {consultant.bio}
              </p>
            )}

            {/* Online Status + Button */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${consultant.is_online ? 'text-tertiary' : 'text-outline'}`}>
                {consultant.is_online ? '● Online' : '● Offline'}
              </span>
              <Link href={`/client/consultants/${consultant.id}`}>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    consultant.is_online
                      ? 'bg-primary text-on-primary hover:opacity-90'
                      : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
                  disabled={!consultant.is_online}
                >
                  {consultant.is_online ? 'Chat Now' : 'Offline'}
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/client/consultants">
          <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
            View All Consultants
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  )
}