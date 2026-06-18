'use client'

import { Provider } from 'react-redux'
import { store } from '@/lib/store/store'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
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
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  )
}