'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Rocket, User, LogOut, ChevronDown, Bell, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { useGetMyConsultationsQuery } from '@/lib/api/consultation'
import { useListConsultantsQuery } from '@/lib/api/consultant'

interface NavbarProps {
  onWalletClick?: () => void
}

export function Navbar({ onWalletClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const { data: consultations } = useGetMyConsultationsQuery({ limit: 5 }, { skip: !isAuthenticated })
  const { data: allConsultants } = useListConsultantsQuery({ limit: 100 }, { skip: !isAuthenticated })

  // Get recent consultants (unique consultants from consultations)
  const recentConsultants = consultations
    ?.filter(c => c.consultant)
    .map(c => c.consultant!)
    .filter((c, index, self) => self.findIndex(cc => cc.id === c.id) === index)
    .slice(0, 5)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleWalletClick = () => {
    setIsDropdownOpen(false)
    onWalletClick?.()
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-on-primary-container" />
          </div>
          <span className="text-xl font-black text-primary">StartEdge</span>
        </Link>

        {/* Desktop Navigation */}
        {/* <div className="hidden md:flex items-center gap-8">
          {isAuthenticated && (
            <Link
              href="/client/consultants"
              className="text-sm font-medium transition-colors hover:text-primary text-on-surface-variant"
            >
              Consultants
            </Link>
          )}
        </div> */}

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notification Icon */}
              <button className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
              </button>

              {/* Wallet Icon */}
              <button
                onClick={handleWalletClick}
                className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors"
              >
                <Wallet size={20}/>
              </button>
              

              {/* Avatar Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={handleAvatarClick}
                  className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                >
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
                  <span>{user?.first_name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-surface-container border border-outline-variant/50 rounded-xl shadow-xl overflow-hidden"
                    >
                      {/* Edit Profile */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          const event = new CustomEvent('openEditProfile')
                          document.dispatchEvent(event)
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors w-full text-left"
                      >
                        <User className="w-4 h-4" />
                        Edit Profile
                      </button>

                      {/* Dashboard */}
                      <Link
                        href="/client/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors w-full text-left"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>

                      {/* Consultants */}
                      <Link
                        href="/client/consultants"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors w-full text-left"
                      >
                        <User className="w-4 h-4" />
                        Consultants
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-outline-variant/30" />

                      {/* Recent Consultations */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                          Recent Consultations
                        </p>
                      </div>
                      {consultations?.slice(0, 3).map((c) => (
                        <Link
                          key={c.id}
                          href={`/client/consultations/${c.id}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors w-full text-left"
                        >
                          <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                            {c.consultant?.avatar_url ? (
                              <img
                                src={c.consultant.avatar_url}
                                alt={c.consultant.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-3 h-3 text-on-surface-variant" />
                            )}
                          </div>
                          <span className="truncate">
                            {c.consultant?.first_name} {c.consultant?.last_name}
                          </span>
                          <span className="ml-auto text-xs text-on-surface-variant">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/client/consultations"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-center px-4 py-2 text-xs text-primary hover:bg-surface-variant transition-colors w-full text-center"
                      >
                        View All Consultations →
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-outline-variant/30" />

                      {/* Recent Consultants */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                          Recent Consultants
                        </p>
                      </div>
                      {recentConsultants?.slice(0, 3).map((c) => (
                        <Link
                          key={c.id}
                          href={`/client/consultants/${c.id}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors w-full text-left"
                        >
                          <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                            {c.avatar_url ? (
                              <img
                                src={c.avatar_url}
                                alt={c.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-3 h-3 text-on-surface-variant" />
                            )}
                          </div>
                          <span className="truncate">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="ml-auto text-xs text-on-surface-variant">
                            {c.specialization_name || c.category}
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/client/consultants"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-center px-4 py-2 text-xs text-primary hover:bg-surface-variant transition-colors w-full text-center"
                      >
                        View All Consultants →
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-outline-variant/30" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-on-surface hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
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

              {isAuthenticated ? (
                <>
                  <Link
                    href="/client/consultants"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-on-surface hover:text-primary transition-colors py-2"
                  >
                    Consultants
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      const event = new CustomEvent('openEditProfile')
                      document.dispatchEvent(event)
                    }}
                    className="text-sm font-medium text-on-surface hover:text-primary transition-colors py-2 text-left"
                  >
                    Edit Profile
                  </button>
                  <Link
                    href="/client/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-on-surface hover:text-primary transition-colors py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/client/consultations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-on-surface hover:text-primary transition-colors py-2"
                  >
                    Consultations
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}