'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

interface TimerBannerProps {
  timeLeft: number
  status: 'waiting' | 'accepted' | 'rejected' | 'expired'
  consultantName: string
  onClose?: () => void
}

export function TimerBanner({
  timeLeft,
  status,
  consultantName,
  onClose,
}: TimerBannerProps) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isWarning = timeLeft < 30

  if (status === 'accepted') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 left-0 right-0 z-40 bg-tertiary/10 border-b border-tertiary/20 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-tertiary" />
            <span className="text-sm font-medium text-on-surface">
              Consultation with {consultantName} accepted!
            </span>
          </div>
          <span className="text-sm text-tertiary font-medium animate-pulse">
            Redirecting to chat...
          </span>
        </div>
      </motion.div>
    )
  }

  if (status === 'rejected' || status === 'expired') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 left-0 right-0 z-40 bg-error/10 border-b border-error/20 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-error" />
            <span className="text-sm font-medium text-on-surface">
              Consultation {status === 'rejected' ? 'rejected' : 'expired'} by {consultantName}
            </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              Dismiss
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-16 left-0 right-0 z-40 border-b backdrop-blur-sm ${
        isWarning ? 'bg-error/10 border-error/20' : 'bg-primary/10 border-primary/20'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${isWarning ? 'text-error' : 'text-primary'} animate-pulse`} />
          <span className="text-sm font-medium text-on-surface">
            Waiting for {consultantName} to accept...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg font-bold ${isWarning ? 'text-error' : 'text-primary'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-on-surface-variant">remaining</span>
        </div>
      </div>
    </motion.div>
  )
}