'use client'

import { useState, useEffect, useRef } from 'react'

interface UseCooldownOptions {
  duration: number // seconds
  onComplete?: () => void
}

export function useCooldown({ duration, onComplete }: UseCooldownOptions) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const start = () => {
    setIsActive(true)
    setTimeLeft(duration)
  }

  const reset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsActive(false)
    setTimeLeft(0)
  }

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            setIsActive(false)
            onCompleteRef.current?.()
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
  }, [isActive, timeLeft])

  return {
    timeLeft,
    isActive,
    start,
    reset,
  }
}