'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, User, Zap, MessageSquare } from 'lucide-react'
import { formatPrice } from '@/lib/utils/utils'

interface IncomingRequestCardProps {
  id: string
  clientName: string
  clientAvatar?: string | null
  requestedMinutes: number
  perMinuteRate: number
  totalAmount: number
  reason?: string | null
  createdAt: string
  onAccept: (id: string) => void
  onReject: (id: string) => void
  isProcessing?: boolean
}

const EXPIRY_SECONDS = 120

export function IncomingRequestCard({
  id,
  clientName,
  clientAvatar,
  requestedMinutes,
  perMinuteRate,
  totalAmount,
  reason,
  createdAt,
  onAccept,
  onReject,
  isProcessing = false,
}: IncomingRequestCardProps) {
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const createdDate = new Date(createdAt)
    const elapsed = Math.floor((Date.now() - createdDate.getTime()) / 1000)
    const remaining = Math.max(0, EXPIRY_SECONDS - elapsed)
    setTimeLeft(remaining)
    setIsExpired(remaining <= 0)

    if (remaining <= 0) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          // Use setTimeout to avoid React render cycle conflict
          setTimeout(() => {
            setIsExpired(true)
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [createdAt])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isWarning = timeLeft < 30
  const timerColor = isWarning ? 'text-error' : timeLeft < 60 ? 'text-yellow-500' : 'text-primary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-w-[280px] max-w-[280px] glass-card p-4 rounded-xl flex-shrink-0 ${
        isExpired ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
          {clientAvatar ? (
            <img src={clientAvatar} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-on-surface-variant" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-on-surface truncate">{clientName}</p>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>{requestedMinutes}m</span>
            <span>•</span>
            <span>{formatPrice(perMinuteRate)}/min</span>
          </div>
          {reason && (
            <div className="flex items-start gap-1 mt-1">
              <MessageSquare className="w-3 h-3 text-on-surface-variant/60 mt-0.5 shrink-0" />
              <p className="text-xs text-on-surface-variant/70 line-clamp-2">{reason}</p>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 font-mono text-sm font-bold shrink-0 ${timerColor}`}>
          <Clock className="w-4 h-4" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/30">
        <div>
          <span className="text-xs text-on-surface-variant">Total</span>
          <p className="font-bold text-sm text-primary">{formatPrice(totalAmount)}</p>
        </div>

        <div className="flex gap-2">
          {isExpired ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-error/10 text-error">
              Expired
            </span>
          ) : (
            <>
              <button
                onClick={() => onReject(id)}
                disabled={isProcessing}
                className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAccept(id)}
                disabled={isProcessing}
                className="p-2 rounded-lg bg-tertiary/10 text-tertiary hover:bg-tertiary/20 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}