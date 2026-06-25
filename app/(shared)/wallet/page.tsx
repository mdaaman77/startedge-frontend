'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useAddMoneyMutation,
} from '@/lib/api/wallet'
import { AddMoneySuccessModal } from '@/components/wallet/AddMoneySuccessModal'
import { formatPrice, formatDate } from '@/lib/utils/utils'

const quickAmounts = [100, 200, 500, 1000]

export default function WalletPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastAddedAmount, setLastAddedAmount] = useState(0)
  const [lastNewBalance, setLastNewBalance] = useState(0)

  const { data: walletBalance, isLoading: balanceLoading, refetch: refetchBalance } =
    useGetWalletBalanceQuery(undefined, {
      skip: !isAuthenticated,
    })

  const { data: transactionsData, refetch: refetchTransactions } =
    useGetWalletTransactionsQuery(
      { limit: 7 },
      { skip: !isAuthenticated }
    )

  const [addMoney, { isLoading: isAddMoneyLoading }] = useAddMoneyMutation()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const balance = walletBalance?.balance || 0
  const transactions = transactionsData?.transactions || []

  const handleAddMoney = async () => {
    const amount = selectedAmount || parseFloat(customAmount)

    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount')
      return
    }

    if (amount < 1) {
      toast.error('Minimum amount is ₹1')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addMoney({ amount }).unwrap()

      setLastAddedAmount(result.amount)
      setLastNewBalance(result.new_balance)

      await Promise.all([refetchBalance(), refetchTransactions()])

      setShowSuccessModal(true)

      setSelectedAmount(null)
      setCustomAmount('')

    } catch (error: unknown) {
      let errorMessage = 'Failed to add money. Please try again.'

      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { detail?: string }
        if (errorData?.detail) {
          errorMessage = errorData.detail
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
  }

  if (authLoading || balanceLoading || !isAuthenticated) {
    return <LoadingSpinner />
  }

  const isLoading = isSubmitting || isAddMoneyLoading

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
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

          <div className="glass-card p-6 rounded-xl mb-8">
            <p className="text-sm text-on-surface-variant">Current Balance</p>
            <p className="text-4xl font-bold text-on-surface">{formatPrice(balance)}</p>
          </div>

          <div className="glass-card p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-4">Add Money</h2>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount('')
                  }}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    selectedAmount === amount
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                  min={1}
                  step={1}
                />
              </div>
              <button
                onClick={handleAddMoney}
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary text-on-primary font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus size={18} />
                    Add
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5">
              <AlertCircle size={14} className="text-outline" />
              Phase 2: Payment gateway integration coming soon
            </p>
          </div>

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

      <AddMoneySuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        amount={lastAddedAmount}
        newBalance={lastNewBalance}
      />
    </div>
  )
}