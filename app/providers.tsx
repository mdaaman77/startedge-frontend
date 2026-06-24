'use client'

import { Provider } from 'react-redux'
import { store } from '@/lib/store/store'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { hydrateAuth } from '@/lib/store/features/authSlice'
import { hydrateTheme } from '@/lib/store/features/themeSlice'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    store.dispatch(hydrateAuth())
    store.dispatch(hydrateTheme())
    setMounted(true)
  }, [])

  return (
    <Provider store={store}>
      {children}
      {mounted && (
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface-container)',
              color: 'var(--color-on-surface)',
              border: '1px solid var(--color-outline-variant)',
            },
          }}
        />
      )}
    </Provider>
  )
}