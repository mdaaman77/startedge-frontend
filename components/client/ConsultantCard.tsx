'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, User, Zap } from 'lucide-react'
import { Consultant } from '@/lib/api/consultant'
import { formatPrice } from '@/lib/utils/utils'

interface ConsultantCardProps {
  consultant: Consultant
  index?: number
}

export function ConsultantCard({ consultant, index = 0 }: ConsultantCardProps) {
  const fullName = `${consultant.first_name} ${consultant.last_name}`
  const displayName = fullName.length > 20 ? `${fullName.slice(0, 18)}...` : fullName
  const specialization = consultant.specialization_name || consultant.category || 'Expert'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="min-w-[260px] max-w-[260px] glass-card p-4 rounded-xl hover:bg-surface-variant/50 transition-all duration-300 group"
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
            {consultant.avatar_url ? (
              <img
                src={consultant.avatar_url}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-on-surface-variant" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-on-surface truncate">
              {displayName}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {specialization}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {consultant.is_online ? (
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-outline-variant" />
          )}
          <span className={`text-[10px] font-medium ${consultant.is_online ? 'text-tertiary' : 'text-outline'}`}>
            {consultant.is_online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Rating & Fee */}
      <div className="flex items-center justify-between mb-3">
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

      {/* CTA Button */}
      <Link href={`/client/consultants/${consultant.id}`}>
        <button
          className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            consultant.is_online
              ? 'bg-primary text-on-primary hover:opacity-90 hover:scale-[0.98]'
              : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
          }`}
          disabled={!consultant.is_online}
        >
          {consultant.is_online ? 'Book Now' : 'Offline'}
        </button>
      </Link>
    </motion.div>
  )
}