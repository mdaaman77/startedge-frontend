'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

export interface DropdownMenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  className?: string
  divider?: boolean
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  align?: 'left' | 'right'
  width?: string
  triggerClassName?: string
}

export function DropdownMenu({
  trigger,
  items,
  isOpen,
  onToggle,
  onClose,
  align = 'right',
  width = 'w-64',
  triggerClassName = '',
}: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleTriggerClick = () => {
    onToggle()
  }

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={handleTriggerClick} className={triggerClassName}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full mt-2 z-50',
              alignClass,
              width,
              'bg-surface-container border border-outline-variant/50 rounded-xl shadow-xl overflow-hidden'
            )}
          >
            <div className="py-1">
              {items.map((item, index) => {
                const Icon = item.icon
                const showDivider = item.divider && index > 0

                return (
                  <div key={item.id}>
                    {showDivider && (
                      <div className="border-t border-outline-variant/30 my-1" />
                    )}
                    <button
                      onClick={item.onClick}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors text-left',
                        item.className
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}