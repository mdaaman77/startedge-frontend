'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Rocket, User, LogOut, ChevronDown, Bell, Wallet,
  LayoutDashboard, Briefcase, DollarSign, Users, MessageCircle, Calendar,Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { useAppDispatch } from '@/lib/store/hooks'
import { openWalletSidebar } from '@/lib/store/features/uiSlice'
import { useGetWalletBalanceQuery } from '@/lib/api/wallet'
import { formatPrice } from '@/lib/utils/utils'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { DropdownMenu, DropdownMenuItem } from '@/components/common/DropdownMenu'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const { data: walletData } = useGetWalletBalanceQuery(undefined, {
    skip: !isAuthenticated,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileModalOpen(true)
    document.addEventListener('openEditProfile', handleOpenProfile)
    return () => document.removeEventListener('openEditProfile', handleOpenProfile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true)
  }

  const handleWalletClick = () => {
    dispatch(openWalletSidebar())
  }

  const isAuthReady = !isLoading && isAuthenticated !== undefined
  const renderAuthContent = mounted && isAuthReady
  const walletBalance = walletData?.balance || 0
  const isClient = user?.role === 'client'
  const isConsultant = user?.role === 'consultant'

  const getDropdownItems = (): DropdownMenuItem[] => {
    const commonItems: DropdownMenuItem[] = [
      {
        id: 'edit-profile',
        label: 'Edit Profile',
        icon: User,
        onClick: handleOpenProfile,
      },
    ]

    const clientItems: DropdownMenuItem[] = [
      {
        id: 'apply-consultant',
        label: 'Apply as Consultant',
        icon: Briefcase,
        onClick: () => router.push('/client/apply-consultant'),
      },
      {
        id: 'recent-consultants',
        label: 'View All Recent Consultants',
        icon: MessageCircle,
        onClick: () => router.push('/chat'),
        divider: true,
      },
    ]

    const consultantItems: DropdownMenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        onClick: () => router.push('/consultant/dashboard'),
      },
      {
        id: 'requests',
        label: 'Incoming Requests',
        icon: Clock,
        onClick: () => router.push('/consultant/requests'),
        divider: true,
      },
      {
        id: 'recent-clients',
        label: 'View All Recent Clients',
        icon: MessageCircle,
        onClick: () => router.push('/chat'),
        divider: true,
      },
    ]
    const adminItems: DropdownMenuItem[] = [
      {
        id: 'admin-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        onClick: () => router.push('/admin/dashboard'),
      },
      {
        id: 'admin-users',
        label: 'Users',
        icon: Users,
        onClick: () => router.push('/admin/users'),
      },
      {
        id: 'admin-consultant-requests',
        label: 'Consultant Requests',
        icon: Briefcase,
        onClick: () => router.push('/admin/consultant-requests'),
      },
      {
        id: 'admin-consultations',
        label: 'Consultations',
        icon: Calendar,
        onClick: () => router.push('/admin/consultations'),
        divider: true,
      },
    ]

    const allItems: DropdownMenuItem[] = [
      ...commonItems,
      ...(isClient ? clientItems : []),
      ...(isConsultant ? consultantItems : []),
      ...(user?.role === 'admin' ? adminItems : []),
      {
        id: 'consultations',
        label: 'View All Consultations',
        icon: Calendar,
        onClick: () => router.push('/consultations'),
        divider: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: LogOut,
        onClick: handleLogout,
        className: 'text-red-400 hover:bg-red-500/10',
      },
    ]

    return allItems
  }

  const dropdownItems = getDropdownItems()

  const getMobileItems = () => {
    const items: { label: string; onClick: () => void; className?: string }[] = [
      { label: 'Edit Profile', onClick: handleOpenProfile },
    ]

    if (isClient) {
      items.push({ label: 'Apply as Consultant', onClick: () => router.push('/client/apply-consultant') })
      items.push({ label: 'View All Recent Consultants', onClick: () => router.push('/chat') })
    }

    if (isConsultant) {
      items.push({ label: 'Dashboard', onClick: () => router.push('/consultant/dashboard') })
      items.push({ label: 'View All Recent Clients', onClick: () => router.push('/chat') })
    }

    if (user?.role === 'admin') {
      items.push({ label: 'Dashboard', onClick: () => router.push('/admin/dashboard') })
      items.push({ label: 'Users', onClick: () => router.push('/admin/users') })
      items.push({ label: 'Consultant Requests', onClick: () => router.push('/admin/consultant-requests') })
      items.push({ label: 'Consultations', onClick: () => router.push('/admin/consultations') })
    }

    items.push({ label: 'View All Consultations', onClick: () => router.push('/consultations') })
    items.push({ label: 'Logout', onClick: handleLogout, className: 'text-red-400' })

    return items
  }

  const mobileItems = getMobileItems()

  const avatarTrigger = (
    <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center overflow-hidden">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.first_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
      </div>
      <span className="hidden sm:inline">{user?.first_name}</span>
      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
    </div>
  )

  // ✅ If not mounted yet, render a placeholder that matches server render
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-auto">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-on-primary-container" />
            </div>
            <span className="text-xl font-black text-primary">StartEdge</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-9 h-9" />
            <div className="w-9 h-9" />
            <div className="w-8 h-8 rounded-full bg-surface-variant animate-pulse" />
          </div>
          <button className="md:hidden text-on-surface">
            <Menu size={24} />
          </button>
        </nav>
      </header>
    )
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30'
            : 'bg-transparent'
          }`}
      >
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-auto">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-on-primary-container" />
            </div>
            <span className="text-xl font-black text-primary">StartEdge</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {renderAuthContent && isAuthenticated ? (
              <>
                <button className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
                </button>

                <button
                  onClick={handleWalletClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 transition-colors"
                  aria-label="Open wallet"
                >
                  <Wallet size={18} className="text-tertiary" />
                  <span className="text-sm font-semibold text-tertiary">
                    {formatPrice(walletBalance)}
                  </span>
                </button>

                <DropdownMenu
                  trigger={avatarTrigger}
                  items={dropdownItems}
                  isOpen={isDropdownOpen}
                  onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                  onClose={() => setIsDropdownOpen(false)}
                  align="right"
                  width="w-64"
                  triggerClassName=""
                />
              </>
            ) : renderAuthContent && !isAuthenticated ? (
              <>
                <Link href="/login">
                  <button className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                    Log In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-all">
                    Sign Up
                  </button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-20 h-8 bg-surface-container-low rounded-lg animate-pulse" />
                <div className="w-20 h-8 bg-surface-container-low rounded-lg animate-pulse" />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-on-surface hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-surface-container border-b border-outline-variant/30 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Theme</span>
                  <ThemeToggle />
                </div>

                <div className="border-t border-outline-variant/20 pt-3" />

                {renderAuthContent && isAuthenticated ? (
                  <>
                    {mobileItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          item.onClick()
                        }}
                        className={`text-sm font-medium text-on-surface hover:text-primary transition-colors py-2 text-left ${item.className || ''
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </>
                ) : renderAuthContent && !isAuthenticated ? (
                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                    <Link href="/login">
                      <button className="w-full text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-2">
                        Log In
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="w-full py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-all">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <div className="w-20 h-8 bg-surface-container-low rounded-lg animate-pulse" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  )
}