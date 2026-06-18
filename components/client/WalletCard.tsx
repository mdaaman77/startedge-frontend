'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wallet, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/utils'

interface WalletCardProps {
  balance: number
}

export function WalletCard({ balance }: WalletCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-6 rounded-xl bg-gradient-to-br from-primary-container/10 to-secondary-container/10 border border-primary/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Wallet Balance</p>
            <p className="text-2xl font-bold text-on-surface">{formatPrice(balance)}</p>
          </div>
        </div>
        <Link href="/client/wallet">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition-all duration-200">
            Go to Wallet
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  )
}