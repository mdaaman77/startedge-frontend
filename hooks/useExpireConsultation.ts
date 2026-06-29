'use client'

import { useCallback } from 'react'
import { useExpireConsultationMutation } from '@/lib/api/consultation'
import toast from 'react-hot-toast'

export function useExpireConsultation() {
  const [expireMutation] = useExpireConsultationMutation()

  const expireConsultation = useCallback(
    async (consultationId: string): Promise<boolean> => {
      try {
        await expireMutation(consultationId).unwrap()
        return true
      } catch (error: any) {
        console.error('Failed to expire consultation:', error)
        // Don't show toast here - let the caller handle UI feedback
        return false
      }
    },
    [expireMutation]
  )

  return { expireConsultation }
}