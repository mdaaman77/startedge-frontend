'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/utils'

interface AddMoneySuccessModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  newBalance: number
}

export function AddMoneySuccessModal({
  isOpen,
  onClose,
  amount,
  newBalance,
}: AddMoneySuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-surface-container rounded-3xl max-w-md w-full pointer-events-auto border border-outline-variant/30 shadow-2xl overflow-hidden">
              <div className="relative pt-12 pb-6 px-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: 0.15,
                  }}
                  className="w-24 h-24 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                      ease: 'easeInOut',
                    }}
                  >
                    <CheckCircle className="w-14 h-14 text-tertiary" strokeWidth={1.5} />
                  </motion.div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-on-surface mb-1"
                >
                  Money Added!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  className="text-4xl font-black text-primary"
                >
                  {formatPrice(amount)}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-on-surface-variant mt-3"
                >
                  New balance:{' '}
                  <span className="font-semibold text-on-surface">
                    {formatPrice(newBalance)}
                  </span>
                </motion.p>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-tertiary/5 blur-3xl pointer-events-none"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none"
                />
              </div>

              <div className="px-6 pb-6 pt-2">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={onClose}
                  className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}