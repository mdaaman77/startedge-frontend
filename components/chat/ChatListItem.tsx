'use client'

import { User } from 'lucide-react'
import { formatDate } from '@/lib/utils/utils'

interface ChatListItemProps {
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
  isOnline?: boolean
  lastMessage?: string | null
  lastMessageTime?: string | null
  subtitle?: string | null
  isSelected: boolean
  hasActiveConsultation?: boolean
  onClick: () => void
}

export function ChatListItem({
  firstName,
  lastName,
  avatarUrl,
  isOnline = false,
  lastMessage,
  lastMessageTime,
  subtitle,
  isSelected,
  hasActiveConsultation = false,
  onClick,
}: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-surface-variant'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-on-surface-variant" />
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-on-surface truncate">
            {firstName} {lastName}
          </p>
          {lastMessageTime && (
            <span className="text-[10px] text-on-surface-variant flex-shrink-0 ml-2">
              {formatDate(lastMessageTime)}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-on-surface-variant truncate">
            {subtitle}
          </p>
        )}
        {lastMessage && (
          <p className="text-xs text-on-surface-variant/70 truncate mt-0.5">
            {lastMessage}
          </p>
        )}
        {hasActiveConsultation && (
          <span className="text-[10px] font-medium text-primary mt-0.5 inline-block">● Active</span>
        )}
      </div>
    </button>
  )
}