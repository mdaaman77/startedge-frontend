'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { setTheme, toggleTheme } from '@/lib/store/features/themeSlice'

export function ThemeInitializer() {
  const dispatch = useDispatch()
  const mode = useSelector((state: RootState) => state.theme.mode)

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = stored || (prefersDark ? 'dark' : 'light')
    dispatch(setTheme(initialTheme as 'light' | 'dark'))
  }, [dispatch])

  // Apply theme when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  return null
}