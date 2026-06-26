'use client'

import { motion } from 'framer-motion'

interface OnlineToggleProps {
  isOnline: boolean
  onToggle: (isOnline: boolean) => void
  isLoading?: boolean
}

export function OnlineToggle({ isOnline, onToggle, isLoading = false }: OnlineToggleProps) {
  const handleToggle = () => {
    if (isLoading) return
    onToggle(!isOnline)
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium ${!isOnline ? 'text-error' : 'text-on-surface-variant'}`}>
        Offline
      </span>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        style={{
          backgroundColor: isOnline ? 'var(--color-tertiary)' : 'var(--color-error)',
        }}
      >
        <motion.div
          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
          initial={false}
          animate={{
            left: isOnline ? 'calc(100% - 28px)' : '4px',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </button>
      <span className={`text-sm font-medium ${isOnline ? 'text-tertiary' : 'text-on-surface-variant'}`}>
        Online
      </span>
      {isLoading && (
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      )}
    </div>
  )
}