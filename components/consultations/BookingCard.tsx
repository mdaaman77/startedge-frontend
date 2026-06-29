'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/utils'
import { Button } from '@/components/ui/Button'

interface BookingCardProps {
  consultantName: string
  perMinuteFee: number
  isOnline: boolean
  isClient: boolean
  isConsultationRequested: boolean
  isConsultationActive: boolean
  hasActiveOrPendingConsultation?: boolean
  walletBalance?: number
  onBookNow: (minutes: number) => void
  onTryAgain: () => void
  status: 'idle' | 'requested' | 'rejected' | 'expired'
  cooldownSeconds?: number
}

const PRESET_DURATIONS = [15, 30, 45, 60]
const MAX_MINUTES = 2000
const MIN_MINUTES = 1

export function BookingCard({
  consultantName,
  perMinuteFee,
  isOnline,
  isClient,
  isConsultationRequested,
  isConsultationActive,
  hasActiveOrPendingConsultation = false,
  walletBalance = 0,
  onBookNow,
  onTryAgain,
  status,
  cooldownSeconds = 0,
}: BookingCardProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(15)
  const [customMinutes, setCustomMinutes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'idle') {
      setSelectedMinutes(15)
      setCustomMinutes('')
    }
  }, [status])

  const getMinutes = (): number => {
    if (customMinutes) {
      const val = parseInt(customMinutes)
      if (!isNaN(val) && val > 0) return Math.min(val, MAX_MINUTES)
    }
    return selectedMinutes || 15
  }

  const totalCost = getMinutes() * perMinuteFee
  const isValid = getMinutes() >= MIN_MINUTES && getMinutes() <= MAX_MINUTES
  const canAfford = walletBalance >= totalCost
  const maxAffordableMinutes = Math.floor(walletBalance / perMinuteFee)

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

  const handleBookNow = async () => {
    if (!isValid || !canAfford || isLoading) return
    setIsLoading(true)
    await onBookNow(getMinutes())
    setIsLoading(false)
  }

  // ✅ Check REQUESTED status FIRST - show waiting state
  if (status === 'requested') {
    return (
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-on-surface mb-4">Waiting for Acceptance</h3>
        <div className="text-center py-6">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-on-surface">
            Waiting for {consultantName} to accept...
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            You can navigate away, the request will stay active for 2 minutes.
          </p>
        </div>
      </div>
    )
  }

  // ✅ Then check for ACTIVE consultation (accepted/in_progress) - NOT requested
  if (hasActiveOrPendingConsultation && isClient && isConsultationActive) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-on-surface mb-4">Consultation Status</h3>
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-medium text-on-surface">
            You already have an active consultation with {consultantName}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            This consultation is currently in progress.
          </p>
          <Button
            onClick={() => window.location.href = '/chat'}
            variant="gradient"
            className="mt-4 w-full"
          >
            Go to Chat
          </Button>
        </div>
      </div>
    )
  }

  if (!isClient || !isOnline) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-on-surface mb-4">
          {isClient ? 'Start Consultation' : 'Consultant Profile'}
        </h3>
        {!isClient && (
          <p className="text-sm text-on-surface-variant">
            You are viewing this consultant's profile.
          </p>
        )}
        {isClient && !isOnline && (
          <div className="text-center py-4">
            <p className="text-sm text-on-surface-variant">Consultant is currently offline</p>
          </div>
        )}
      </div>
    )
  }

  if (status === 'rejected' || status === 'expired') {
    return (
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-on-surface mb-4">Start Consultation</h3>
        <div className="text-center py-4">
          <p className="text-sm text-error font-medium">
            {status === 'rejected' ? 'Consultation rejected' : 'Request expired'}
          </p>
          {cooldownSeconds && cooldownSeconds > 0 ? (
            <div className="mt-4">
              <p className="text-sm text-on-surface-variant">
                Please wait <span className="font-bold text-error">{cooldownSeconds}s</span> before trying again
              </p>
            </div>
          ) : (
            <Button
              onClick={onTryAgain}
              variant="gradient"
              className="mt-4 w-full"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="font-bold text-on-surface mb-4">Start Consultation</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">Rate</span>
          <span className="font-bold text-on-surface">{formatPrice(perMinuteFee)}/min</span>
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
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              className="w-28 px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            <span className="text-xs text-on-surface-variant">max {MAX_MINUTES}m</span>
          </div>
          {!isValid && (
            <p className="text-error text-xs mt-1">
              Please enter a valid duration (1-{MAX_MINUTES} minutes)
            </p>
          )}
        </div>

        {walletBalance > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Wallet Balance</span>
            <span className="font-medium text-on-surface">{formatPrice(walletBalance)}</span>
          </div>
        )}

        {maxAffordableMinutes > 0 && maxAffordableMinutes < getMinutes() && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-error/10 border border-error/20">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <p className="text-xs text-error">
              Insufficient balance. You can afford {maxAffordableMinutes} minutes max.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between py-3 border-t border-outline-variant/30">
          <span className="text-sm font-semibold text-on-surface">Total</span>
          <span className={`text-xl font-bold ${canAfford && isValid ? 'text-primary' : 'text-error'}`}>
            {formatPrice(totalCost)}
          </span>
        </div>

        <Button
          onClick={handleBookNow}
          variant="gradient"
          className="w-full"
          disabled={!isValid || !canAfford || isLoading || isConsultationRequested}
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

        {!canAfford && isValid && (
          <p className="text-xs text-error text-center">
            Please add money to your wallet to book this consultation.
          </p>
        )}
      </div>
    </div>
  )
}