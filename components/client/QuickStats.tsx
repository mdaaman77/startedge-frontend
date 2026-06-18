'use client'

import { motion } from 'framer-motion'
import { Wallet, Calendar, Clock } from 'lucide-react'

interface QuickStatsProps {
  totalSpent: number
  totalConsultations: number
  activeNow: number
}

export function QuickStats({ totalSpent, totalConsultations, activeNow }: QuickStatsProps) {
  const stats = [
    {
      icon: Wallet,
      label: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      color: 'text-primary',
    },
    {
      icon: Calendar,
      label: 'Total Consultations',
      value: totalConsultations,
      color: 'text-secondary',
    },
    {
      icon: Clock,
      label: 'Active Now',
      value: activeNow,
      color: 'text-tertiary',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="glass-card p-4 rounded-xl flex items-center gap-4"
        >
          <div className={`w-10 h-10 rounded-lg bg-surface-variant/50 flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}