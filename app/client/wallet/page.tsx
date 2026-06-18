'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery } from '@/lib/api/wallet'
import { formatPrice, formatDate } from '@/lib/utils/utils'

const quickAmounts = [100, 200, 500, 1000]

export default function WalletPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const { data: walletBalance, isLoading: balanceLoading } = useGetWalletBalanceQuery(undefined, {
    skip: !isAuthenticated,
  })

  const { data: transactionsData } = useGetWalletTransactionsQuery(
    { limit: 7 },
    { skip: !isAuthenticated }
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || balanceLoading || !isAuthenticated) {
    return <LoadingSpinner />
  }

  const balance = walletBalance?.balance || 0
  const transactions = transactionsData?.transactions || []

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
            onClick={() => router.push('/client/dashboard')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          {/* Balance */}
          <div className="glass-card p-6 rounded-xl mb-8">
            <p className="text-sm text-on-surface-variant">Current Balance</p>
            <p className="text-4xl font-bold text-on-surface">{formatPrice(balance)}</p>
          </div>

          {/* Add Money Section */}
          <div className="glass-card p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-4">Add Money</h2>

            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount('')
                  }}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAmount === amount
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex gap-3">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                placeholder="Custom amount"
                className="flex-1 px-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                min={1}
              />
              <button className="px-6 py-2 bg-primary text-on-primary font-medium rounded-lg hover:opacity-90 transition-all">
                <Plus size={18} className="inline mr-1" />
                Add
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Phase 2: Payment gateway integration coming soon
            </p>
          </div>

          {/* Last 7 Transactions */}
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-variant transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {tx.description || 'Transaction'}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold ${
                        tx.type === 'credit' ? 'text-tertiary' : 'text-error'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}
                      {formatPrice(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}