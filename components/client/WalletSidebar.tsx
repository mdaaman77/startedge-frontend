'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/utils'

interface Transaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  description: string | null
  created_at: string
}

interface WalletSidebarProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  transactions: Transaction[]
}

export function WalletSidebar({ isOpen, onClose, balance, transactions }: WalletSidebarProps) {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true
    return t.type === filter
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-surface-container border-l border-outline-variant/30 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Wallet
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Balance */}
            <div className="p-6 bg-surface-container-low border-b border-outline-variant/30">
              <p className="text-sm text-on-surface-variant">Current Balance</p>
              <p className="text-3xl font-bold text-on-surface">{formatPrice(balance)}</p>
              <button
                onClick={() => {
                  onClose()
                  window.location.href = '/client/wallet'
                }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Add Money →
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 p-4 border-b border-outline-variant/30">
              <Filter size={16} className="text-on-surface-variant" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('credit')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'credit'
                    ? 'bg-tertiary text-on-tertiary'
                    : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Credit
              </button>
              <button
                onClick={() => setFilter('debit')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'debit'
                    ? 'bg-error text-on-error'
                    : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Debit
              </button>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  No transactions found.
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-variant transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'credit'
                            ? 'bg-tertiary/20 text-tertiary'
                            : 'bg-error/20 text-error'
                        }`}
                      >
                        {tx.type === 'credit' ? (
                          <ArrowUpRight size={18} />
                        ) : (
                          <ArrowDownRight size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {tx.description || 'Transaction'}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
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
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}