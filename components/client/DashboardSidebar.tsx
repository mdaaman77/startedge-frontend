'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Wallet, Calendar, Users, Menu, X } from 'lucide-react'

interface DashboardSidebarProps {
  onWalletClick: () => void
}

export function DashboardSidebar({ onWalletClick }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/client/dashboard' },
    { name: 'Wallet', icon: Wallet, onClick: onWalletClick },
    { name: 'Consultations', icon: Calendar, href: '/client/consultations' },
    { name: 'Consultants', icon: Users, href: '/client/consultants' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-40 p-3 bg-surface-container rounded-xl border border-outline-variant/30 shadow-xl"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-16 bottom-0 w-[260px] bg-surface-container border-r border-outline-variant/30 z-30 overflow-y-auto transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileOpen(false)
                    item.onClick?.()
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all duration-200 w-full"
                >
                  <item.icon size={20} />
                  {item.name}
                </button>
              )}
            </div>
          ))}
        </nav>
      </motion.aside>

      {/* Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}