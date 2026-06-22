'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WalletSidebar } from '@/components/client/WalletSidebar'
import { EditProfileModal } from '@/components/client/EditProfileModal'
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery } from '@/lib/api/wallet'
import { formatPrice } from '@/lib/utils/utils'
import ConsultantsPage from "@/app/client/consultants/page";

export default function ClientDashboard() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const { data: walletBalance } = useGetWalletBalanceQuery(undefined, {
    skip: !isAuthenticated,
  })

  const { data: transactionsData } = useGetWalletTransactionsQuery(
    { limit: 5 },
    { skip: !isAuthenticated }
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileModalOpen(true)
    document.addEventListener('openEditProfile', handleOpenProfile)
    return () => document.removeEventListener('openEditProfile', handleOpenProfile)
  }, [])

  if (isLoading || !user) {
    return <LoadingSpinner />
  }

  const balance = walletBalance?.balance || 0
  const transactions = transactionsData?.transactions || []

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onWalletClick={() => setIsWalletOpen(true)} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome + Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
              Welcome, {user.first_name}
            </h1>
            <p className="text-on-surface-variant">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Wallet Card - Right Side */}
          <div className="glass-card p-4 rounded-xl min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-variant">Wallet Balance</p>
                <p className="text-2xl font-bold text-on-surface">
                  {formatPrice(balance)}
                </p>
              </div>
              <button
                onClick={() => setIsWalletOpen(true)}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition-all"
              >
                View
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Wallet Sidebar */}
      <WalletSidebar
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={balance}
        transactions={transactions}
      />
      {/* consultants list */}
<div className="[&>div]:min-h-0 [&_main]:pt-6 [&_main]:pb-0 [&_main]:mx-auto ">
  <ConsultantsPage />
</div>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <Footer />
    </div>
  )
}