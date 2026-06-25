'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Clock, Zap, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '@/lib/utils/utils'
import { Button } from '@/components/ui/Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  consultantName: string
  consultantAvatar?: string | null
  duration: number
  totalCost: number
  perMinuteFee: number
  isLoading: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  consultantName,
  consultantAvatar,
  duration,
  totalCost,
  perMinuteFee,
  isLoading,
}: ConfirmationModalProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason.trim())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-surface-container rounded-2xl max-w-md w-full pointer-events-auto border border-outline-variant/30 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <h2 className="text-xl font-bold text-on-surface">Confirm Consultation</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                    {consultantAvatar ? (
                      <img src={consultantAvatar} alt={consultantName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-on-surface-variant" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{consultantName}</p>
                    <p className="text-xs text-on-surface-variant">{formatPrice(perMinuteFee)}/min</p>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="font-medium text-on-surface">{duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-primary">{formatPrice(totalCost)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">
                    Reason / Topic <span className="text-xs text-on-surface-variant/60">(optional)</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="What would you like to discuss?"
                    rows={3}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <p className="text-xs text-on-surface-variant text-center">
                  By confirming, you agree to the consultation terms. No money will be deducted until the consultant accepts.
                </p>

                <div className="flex gap-3">
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    variant="gradient"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}