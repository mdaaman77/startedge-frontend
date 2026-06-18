'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils/utils'

interface Consultation {
  id: string
  consultant_name: string
  consultant_avatar?: string
  date: string
  duration: number
  amount: number
  status: 'completed' | 'in_progress' | 'cancelled' | 'requested' | 'accepted'
}

interface RecentConsultationsProps {
  consultations: Consultation[]
}

const statusColors = {
  completed: 'text-tertiary bg-tertiary/10',
  in_progress: 'text-secondary bg-secondary/10',
  cancelled: 'text-error bg-error/10',
  requested: 'text-primary bg-primary/10',
  accepted: 'text-secondary bg-secondary/10',
}

export function RecentConsultations({ consultations }: RecentConsultationsProps) {
  if (!consultations || consultations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-on-surface-variant">No consultations yet.</p>
        <Link href="/client/consultants">
          <button className="mt-4 text-primary font-medium hover:underline">
            Find a Consultant
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-on-surface-variant border-b border-outline-variant/20">
              <th className="pb-3 font-medium">Consultant</th>
              <th className="pb-3 font-medium hidden md:table-cell">Date & Time</th>
              <th className="pb-3 font-medium">Duration</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation, index) => (
              <motion.tr
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors"
              >
                <td className="py-3 font-medium text-on-surface">
                  {consultation.consultant_name}
                </td>
                <td className="py-3 text-on-surface-variant hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(consultation.date)}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{new Date(consultation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td className="py-3 text-on-surface-variant">
                  {consultation.duration}m
                </td>
                <td className="py-3 font-medium text-on-surface">
                  {formatPrice(consultation.amount)}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[consultation.status]}`}>
                    {consultation.status.toUpperCase()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/client/consultations">
          <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
            View All Consultations
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  )
}