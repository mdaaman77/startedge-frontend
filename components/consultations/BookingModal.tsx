'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Clock, User, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '@/lib/utils/utils'
import { Button } from '@/components/ui/Button'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (minutes: number, reason: string) => void
  consultantName: string
  consultantAvatar?: string | null
  perMinuteFee: number
  isLoading: boolean
}

const PRESET_DURATIONS = [15, 30, 45, 60]

export function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  consultantName,
  consultantAvatar,
  perMinuteFee,
  isLoading,
}: BookingModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(15)
  const [customMinutes, setCustomMinutes] = useState('')
  const [reason, setReason] = useState('')

  const getMinutes = (): number => {
    if (customMinutes) {
      const val = parseInt(customMinutes)
      if (!isNaN(val) && val > 0) return val
    }
    return selectedMinutes || 15
  }

  const totalCost = getMinutes() * perMinuteFee
  const isValid = getMinutes() > 0 && getMinutes() <= 120

  const handlePresetClick = (mins: number) => {
    setSelectedMinutes(mins)
    setCustomMinutes('')
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomMinutes(val)
    if (val) {
      setSelectedMinutes(null)
    }
  }

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm(getMinutes(), reason.trim())
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
            <div className="bg-surface-container rounded-2xl max-w-md w-full pointer-events-auto border border-outline-variant/30 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <h2 className="text-xl font-bold text-on-surface">Start Consultation</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                    {consultantAvatar ? (
                      <img src={consultantAvatar} alt={consultantName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{consultantName}</p>
                    <p className="text-xs text-on-surface-variant">{formatPrice(perMinuteFee)}/min</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">
                    Duration (minutes)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESET_DURATIONS.map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handlePresetClick(mins)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedMinutes === mins
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-on-surface-variant">Custom:</span>
                    <input
                      type="number"
                      value={customMinutes}
                      onChange={handleCustomChange}
                      placeholder="Enter minutes"
                      min={1}
                      max={120}
                      className="w-28 px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-xs text-on-surface-variant">(max 120)</span>
                  </div>
                  {!isValid && (
                    <p className="text-error text-xs mt-1">Please enter a valid duration (1-120 minutes)</p>
                  )}
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

                <div className="flex items-center justify-between py-3 border-t border-outline-variant/30">
                  <span className="text-sm font-semibold text-on-surface">Total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(totalCost)}</span>
                </div>

                <div className="flex gap-3">
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    variant="gradient"
                    className="flex-1"
                    disabled={isLoading || !isValid}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Book Now
                      </>
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