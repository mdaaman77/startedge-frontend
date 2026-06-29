'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type TimerStatus = 'idle' | 'running' | 'expired' | 'cooldown'

interface UseConsultationTimerOptions {
  duration?: number // seconds
  cooldownDuration?: number // seconds
  onExpire?: () => void // Called when timer hits 0 - API call should happen here
  onCooldownComplete?: () => void // Called after cooldown finishes
}

export function useConsultationTimer({
  duration = 120,
  cooldownDuration = 60,
  onExpire,
  onCooldownComplete,
}: UseConsultationTimerOptions = {}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const onExpireRef = useRef(onExpire)
  const onCooldownCompleteRef = useRef(onCooldownComplete)
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    onCooldownCompleteRef.current = onCooldownComplete
  }, [onCooldownComplete])

  const start = useCallback(() => {
    hasExpiredRef.current = false
    setStatus('running')
    setTimeLeft(duration)
  }, [duration])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    hasExpiredRef.current = false
    setStatus('idle')
    setTimeLeft(duration)
  }, [duration])

  const expire = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (!hasExpiredRef.current) {
      hasExpiredRef.current = true
      setStatus('expired')
      setTimeLeft(0)
      onExpireRef.current?.()
    }
  }, [])

  const startCooldown = useCallback(() => {
    setStatus('cooldown')
    setTimeLeft(cooldownDuration)
  }, [cooldownDuration])

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    hasExpiredRef.current = false
    setStatus('idle')
    setTimeLeft(duration)
  }, [duration])

  // Timer countdown
  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true
              setStatus('expired')
              setTimeLeft(0)
              onExpireRef.current?.()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Cooldown countdown
    if (status === 'cooldown' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            setStatus('idle')
            setTimeLeft(duration)
            onCooldownCompleteRef.current?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [status, timeLeft, duration])

  return {
    timeLeft,
    status,
    isRunning: status === 'running',
    isExpired: status === 'expired',
    isCooldown: status === 'cooldown',
    start,
    stop,
    expire,
    startCooldown,
    reset,
  }
}