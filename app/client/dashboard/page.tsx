'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { DashboardSidebar } from '@/components/common/DashboardSidebar'
import { WalletSidebar } from '@/components/wallet/WalletSidebar'
import { WalletCard } from '@/components/wallet/WalletCard'
import { QuickStats } from '@/components/client/QuickStats'
import { RecentConsultations } from '@/components/client/RecentConsultations'
import { useGetWalletBalanceQuery } from '@/lib/api/wallet'
import { useGetMyConsultationsQuery } from '@/lib/api/consultation'
import { Button } from '@/components/ui/Button'

export default function ClientDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isWalletOpen, setIsWalletOpen] = useState(false)

  const { data: walletData } = useGetWalletBalanceQuery()
  const { data: consultations } = useGetMyConsultationsQuery({ limit: 5 })

  const balance = walletData?.balance || 0

  const stats = {
    totalSpent: consultations?.reduce((sum, c) => sum + c.total_amount, 0) || 0,
    totalConsultations: consultations?.length || 0,
    activeNow: consultations?.filter(c => c.status === 'in_progress').length || 0,
  }

  const recentConsultations = consultations?.slice(0, 5).map(c => ({
    id: c.id,
    consultant_name: c.consultant ? `${c.consultant.first_name} ${c.consultant.last_name}` : 'Unknown',
    consultant_avatar: c.consultant?.avatar_url,
    date: c.created_at,
    duration: c.requested_minutes,
    amount: c.total_amount,
    status: c.status as any,
  })) || []

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="flex">
        <DashboardSidebar onWalletClick={() => setIsWalletOpen(true)} />

        <main className="flex-1 container mx-auto px-4 pt-24 pb-12 lg:ml-[260px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-on-surface">
                Welcome, {user?.first_name}
              </h1>
              <p className="text-on-surface-variant">
                Here's your consultation overview
              </p>
            </div>
            <Button
              onClick={() => router.push('/consultations')}
              variant="outline"
            >
              View All Consultations →
            </Button>
          </div>

          <div className="space-y-6">
            <WalletCard balance={balance} />
            <QuickStats {...stats} />
            <RecentConsultations consultations={recentConsultations} />
          </div>
        </main>
      </div>

      <WalletSidebar
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={balance}
        transactions={[]}
      />
    </div>
  )
}