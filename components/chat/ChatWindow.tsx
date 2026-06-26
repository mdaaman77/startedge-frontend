'use client'

import { useRef, useEffect, useState } from 'react'
import { MessageCircle, Send, User, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils/utils'

interface Message {
  id: string
  content: string
  role: 'client' | 'consultant' | 'system'
  created_at: string
  is_read: boolean
  user_id?: string | null
}

interface ChatWindowProps {
  otherUser: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string | null
    is_online?: boolean
  } | null
  messages: Message[]
  isLoading: boolean
  hasActiveConsultation: boolean
  isConsultationRequested: boolean
  canStartConsultation?: boolean
  onSendMessage?: (content: string) => void
  onStartConsultation?: () => void
  onAcceptRequest?: () => void
  onRejectRequest?: () => void
  timerSeconds?: number
  userRole: 'client' | 'consultant'
  totalConversations?: number
}

export function ChatWindow({
  otherUser,
  messages,
  isLoading,
  hasActiveConsultation,
  isConsultationRequested,
  canStartConsultation = true,
  onSendMessage,
  onStartConsultation,
  onAcceptRequest,
  onRejectRequest,
  timerSeconds = 0,
  userRole,
  totalConversations = 0,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim() || !onSendMessage) return
    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <MessageCircle className="w-16 h-16 text-primary/30" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-on-surface mb-3">Welcome to Your Chats</h3>
        <p className="text-on-surface-variant text-center max-w-sm text-sm leading-relaxed">
          Select a conversation from the sidebar to view messages and continue your consultation.
        </p>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/10" />
        </div>
        <div className="mt-4 text-xs text-on-surface-variant/60">
          {totalConversations} conversations available
        </div>
      </div>
    )
  }

  const isClient = userRole === 'client'
  const fullName = `${otherUser.first_name} ${otherUser.last_name}`

  // ✅ Show timer only if requested AND timerSeconds > 0
  const showTimer = isConsultationRequested && timerSeconds > 0

  return (
    <div className="flex-1 flex flex-col bg-surface">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-outline-variant/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
              {otherUser.avatar_url ? (
                <img src={otherUser.avatar_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-on-surface-variant" />
              )}
            </div>
            {otherUser.is_online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container" />
            )}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">{fullName}</p>
            <p className="text-xs">
              {otherUser.is_online ? (
                <span className="text-green-500 font-medium">Online</span>
              ) : (
                <span className="text-on-surface-variant">Offline</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="p-2 rounded-full hover:bg-surface-variant transition-colors">
            <Phone className="w-4 h-4 text-on-surface-variant" />
          </button>
          <button className="p-2 rounded-full hover:bg-surface-variant transition-colors">
            <Video className="w-4 h-4 text-on-surface-variant" />
          </button>
          <button className="p-2 rounded-full hover:bg-surface-variant transition-colors">
            <MoreVertical className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface/50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-outline" />
            </div>
            <p className="text-on-surface-variant text-sm font-medium">No messages yet</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">Start a consultation to begin chatting</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = (isClient && msg.role === 'client') || (!isClient && msg.role === 'consultant')
            const prevMsg = index > 0 ? messages[index - 1] : null
            const showDate = index === 0 || new Date(msg.created_at).toDateString() !== new Date(prevMsg?.created_at).toDateString()
            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.role === msg.role)

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-on-surface-variant bg-surface-container/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!isOwn && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden flex-shrink-0 mb-1">
                      {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-primary text-on-primary rounded-br-sm'
                      : 'bg-surface-container text-on-surface rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isOwn ? 'text-primary-200/80' : 'text-on-surface-variant/60'
                    }`}>
                      <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                      {isOwn && (
                        <span className="text-[10px]">
                          {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-surface-container border-t border-outline-variant/30 flex-shrink-0">
        {/* Show waiting for acceptance timer - only when timerSeconds > 0 */}
        {showTimer && (
          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-primary/20">
            <div>
              <p className="text-sm font-medium text-on-surface">Waiting for {isClient ? 'consultant' : 'client'} to accept...</p>
              <p className="text-xs text-on-surface-variant">{timerSeconds}s remaining</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{timerSeconds}s</span>
            </div>
          </div>
        )}

        {/* Show Accept/Reject buttons ONLY if there's a pending request AND user is consultant */}
        {isConsultationRequested && timerSeconds > 0 && userRole === 'consultant' && (
          <div className="flex items-center gap-2 w-full">
            <Button onClick={onAcceptRequest} variant="gradient" className="flex-1 rounded-full">
              Accept Request
            </Button>
            <Button onClick={onRejectRequest} variant="outline" className="flex-1 rounded-full">
              Reject
            </Button>
          </div>
        )}

        {/* Show message input when consultation is active */}
        {hasActiveConsultation && !isConsultationRequested && (
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-1 border border-outline-variant/30">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-2 py-2 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Show "Start Consultation" for clients when no active consultation and no pending request */}
        {!hasActiveConsultation && !isConsultationRequested && userRole === 'client' && (
          <div className="flex flex-col items-center gap-2">
            {canStartConsultation && otherUser.is_online ? (
              <Button onClick={onStartConsultation} variant="gradient" className="w-full rounded-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Consultation
              </Button>
            ) : !canStartConsultation ? (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
                <span>You have already requested a consultation</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <span>Consultant is offline</span>
              </div>
            )}
          </div>
        )}

        {/* Show nothing for consultant when no active consultation and no pending request */}
        {!hasActiveConsultation && !isConsultationRequested && userRole === 'consultant' && (
          <div className="flex items-center justify-center text-on-surface-variant text-sm py-2">
            <span>No active consultation</span>
          </div>
        )}
      </div>
    </div>
  )
}