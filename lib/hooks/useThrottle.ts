'use client'

import { useRef, useCallback } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 1000
): T {
  const lastCall = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (lastCall.current === 0) {
        lastCall.current = now
        return fn(...args)
      }

      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return fn(...args)
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now()
        timeoutRef.current = null
        fn(...args)
      }, delay - (now - lastCall.current))

      return undefined
    },
    [fn, delay]
  ) as T
}