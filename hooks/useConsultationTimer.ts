'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseConsultationTimerOptions {
  duration?: number
  onExpire?: () => void
}

export function useConsultationTimer({
  duration = 120,
  onExpire,
}: UseConsultationTimerOptions = {}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const start = useCallback(() => {
    setIsRunning(true)
    setTimeLeft(duration)
  }, [duration])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
    setTimeLeft(duration)
  }, [duration])

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            setIsRunning(false)
            onExpireRef.current?.()
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
  }, [isRunning, timeLeft])

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
  }
}