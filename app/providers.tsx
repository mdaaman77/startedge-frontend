'use client'

import { Provider } from 'react-redux'
import { store } from '@/lib/store/store'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import { hydrateAuth } from '@/lib/store/features/authSlice'
import { hydrateTheme } from '@/lib/store/features/themeSlice'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateAuth())
    store.dispatch(hydrateTheme())
  }, [])

  return (
    <Provider store={store}>
      <ThemeProvider 
        attribute="data-theme" 
        defaultTheme="dark" 
        enableSystem={false}
        enableColorScheme={false}
        disableTransitionOnChange
      >
        {children}
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
      </ThemeProvider>
    </Provider>
  )
}