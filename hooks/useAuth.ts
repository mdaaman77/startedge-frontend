'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useGetMeQuery, useLogoutMutation } from '@/lib/api/auth'

export const useAuth = () => {
  const router = useRouter()
  const pathname = usePathname()

  // Only run getMe if token exists in localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const { data: user, isLoading, isError, refetch } = useGetMeQuery(undefined, {
    skip: !token,
  })

  const [logout] = useLogoutMutation()

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      if (pathname !== '/login' && pathname !== '/register' && pathname !== '/verify-otp') {
        router.push('/login')
      }
    }
  }, [isError, router, pathname])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    if (user.role === 'client') return '/client/dashboard'
    if (user.role === 'consultant') return '/consultant/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/'
  }

  return {
    user,
    isLoading: isLoading || (!!token && !user),
    isAuthenticated: !!user,
    isClient: user?.role === 'client',
    isConsultant: user?.role === 'consultant',
    isAdmin: user?.role === 'admin',
    refetch,
    logout: handleLogout,
    getDashboardPath,
  }
}