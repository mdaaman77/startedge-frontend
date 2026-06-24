import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { WalletWrapper } from '@/components/ui/WalletWrapper'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { ThemeInitializer } from '@/components/ui/ThemeInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StartEdge - Consultation Platform',
  description: 'Connect with expert consultants instantly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ThemeInitializer />
          <Navbar />
          <main className="min-h-screen bg-surface">{children}</main>
          {/* <Footer /> */}
          <WalletWrapper />
        </Providers>
      </body>
    </html>
  )
}