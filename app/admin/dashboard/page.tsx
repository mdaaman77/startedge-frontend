'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, UserCheck, FileText, AlertCircle, ChevronRight, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/Navbar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatPrice } from '@/lib/utils/utils'
import { useGetMyConsultationsQuery } from '@/lib/api/consultation'
import { useListConsultantsQuery } from '@/lib/api/consultant'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center text-${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-on-surface">{value}</p>
          <p className="text-xs text-on-surface-variant">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  const { data: consultations, isLoading: consultationsLoading } = useGetMyConsultationsQuery(
    { limit: 100 },
    { skip: !isAuthenticated || user?.role !== 'admin' }
  )

  const { data: consultants, isLoading: consultantsLoading } = useListConsultantsQuery(
    { limit: 100 },
    { skip: !isAuthenticated || user?.role !== 'admin' }
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && mounted) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      if (user?.role !== 'admin') {
        router.push('/')
        return
      }
    }
  }, [authLoading, mounted, isAuthenticated, user, router])

  if (!mounted || authLoading || consultationsLoading || consultantsLoading) {
    return <LoadingSpinner />
  }

  const totalConsultations = consultations?.length || 0
  const totalConsultants = consultants?.length || 0
  const issuesPending = consultations?.filter(c => c.raised_issue && c.issue_resolved_by_admin === null).length || 0
  const totalUsers = 0

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-on-surface">
                Welcome back, {user?.first_name}
              </h1>
              <p className="text-on-surface-variant">Manage the StartEdge platform</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="w-5 h-5 text-primary" />}
              label="Total Users"
              value={totalUsers}
              color="primary"
            />
            <StatCard
              icon={<UserCheck className="w-5 h-5 text-tertiary" />}
              label="Total Consultants"
              value={totalConsultants}
              color="tertiary"
            />
            <StatCard
              icon={<FileText className="w-5 h-5 text-secondary" />}
              label="Total Consultations"
              value={totalConsultations}
              color="secondary"
            />
            <StatCard
              icon={<AlertCircle className="w-5 h-5 text-error" />}
              label="Issues Pending"
              value={issuesPending}
              color="error"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-on-surface">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-variant transition-colors"
                >
                  <span className="text-sm text-on-surface">Manage Users</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button
                  onClick={() => router.push('/admin/consultant-requests')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-variant transition-colors"
                >
                  <span className="text-sm text-on-surface">Review Consultant Requests</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button
                  onClick={() => router.push('/admin/consultations')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-variant transition-colors"
                >
                  <span className="text-sm text-on-surface">View All Consultations</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button
                  onClick={() => router.push('/admin/issues')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-variant transition-colors"
                >
                  <span className="text-sm text-on-surface">Review Issues</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-on-surface">Platform Stats</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                  <span className="text-sm text-on-surface-variant">Total Revenue</span>
                  <span className="text-sm font-bold text-on-surface">₹0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                  <span className="text-sm text-on-surface-variant">Total Payouts</span>
                  <span className="text-sm font-bold text-on-surface">₹0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                  <span className="text-sm text-on-surface-variant">Platform Fee</span>
                  <span className="text-sm font-bold text-on-surface">20%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                  <span className="text-sm text-on-surface-variant">Active Consultants</span>
                  <span className="text-sm font-bold text-on-surface">
                    {consultants?.filter(c => c.is_online).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}