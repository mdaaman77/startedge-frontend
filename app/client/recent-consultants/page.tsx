'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, MessageCircle, User, CircleOff, Send, ArrowLeft, 
  Phone, Video, MoreVertical, Check, CheckCheck, Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetRecentConsultantsQuery, useGetChatHistoryQuery } from '@/lib/api/consultation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils/utils'

// --- Chat Window Component ---
function ChatWindow({ 
  consultant, 
  messages, 
  isLoading, 
  hasOngoingConsultation,
  onStartConsultation,
  totalConsultants = 0,
}: {
  consultant: any
  messages: any[]
  isLoading: boolean
  hasOngoingConsultation: boolean
  onStartConsultation: () => void
  totalConsultants?: number
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!consultant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <MessageCircle className="w-16 h-16 text-primary/30" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-primary" />
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
          {totalConsultants} conversations available
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-surface">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-outline-variant/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
              {consultant.avatar_url ? (
                <img src={consultant.avatar_url} alt={consultant.first_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-on-surface-variant" />
              )}
            </div>
            {consultant.is_online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container" />
            )}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">
              {consultant.first_name} {consultant.last_name}
            </p>
            <p className="text-xs">
              {consultant.is_online ? (
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
            <LoadingSpinner />
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
            const isClient = msg.role === 'client'
            const prevMsg = index > 0 ? messages[index - 1] : null
            const showDate = index === 0 || new Date(msg.created_at).toDateString() !== new Date(prevMsg?.created_at).toDateString()
            const showAvatar = !isClient && (index === 0 || messages[index - 1]?.role !== 'consultant')
            
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-on-surface-variant bg-surface-container/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!isClient && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden flex-shrink-0 mb-1">
                      {consultant.avatar_url ? (
                        <img src={consultant.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isClient 
                      ? 'bg-primary text-on-primary rounded-br-sm' 
                      : 'bg-surface-container text-on-surface rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isClient ? 'text-primary-200/80' : 'text-on-surface-variant/60'
                    }`}>
                      <span className="text-[10px]">
                        {formatTime(msg.created_at)}
                      </span>
                      {isClient && (
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
        {hasOngoingConsultation ? (
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-1 border border-outline-variant/30">
            <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-2 py-2 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            <button className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {consultant.is_online ? (
              <Button
                onClick={onStartConsultation}
                variant="gradient"
                className="w-full rounded-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Consultation
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <CircleOff className="w-4 h-4" />
                <span>Consultant is offline</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Consultant List Item Component ---
function ConsultantListItem({ 
  consultant, 
  isSelected, 
  onClick 
}: { 
  consultant: any
  isSelected: boolean
  onClick: () => void
}) {
  const lastMessage = consultant.last_message || ''
  const lastMessageTime = consultant.last_message_time

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
          {consultant.avatar_url ? (
            <img src={consultant.avatar_url} alt={consultant.first_name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-on-surface-variant" />
          )}
        </div>
        {consultant.is_online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-on-surface truncate">
            {consultant.first_name} {consultant.last_name}
          </p>
          {lastMessageTime && (
            <span className="text-[10px] text-on-surface-variant flex-shrink-0 ml-2">
              {formatDate(lastMessageTime)}
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant truncate">
          {consultant.specialization_name || 'Consultant'}
        </p>
        {lastMessage && (
          <p className="text-xs text-on-surface-variant/70 truncate mt-0.5">
            {lastMessage}
          </p>
        )}
        {consultant.has_ongoing_consultation && (
          <span className="text-[10px] font-medium text-primary mt-0.5 inline-block">● Active</span>
        )}
      </div>
    </button>
  )
}

// --- Main Page ---
export default function RecentConsultantsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedMinutes, setSelectedMinutes] = useState(15)

  // ✅ Add client-side hydration check
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { 
    data: consultants, 
    isLoading: consultantsLoading, 
    error 
  } = useGetRecentConsultantsQuery()

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching recent consultants:', error)
    }
    if (consultants) {
      console.log('✅ Recent consultants data:', consultants)
    }
  }, [consultants, error])
  
  const { 
    data: messages, 
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useGetChatHistoryQuery(
    selectedConsultant?.id,
    { skip: !selectedConsultant }
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (selectedConsultant) {
      refetchMessages()
    }
  }, [selectedConsultant, refetchMessages])

  const filteredConsultants = consultants?.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleConsultantClick = (consultant: any) => {
    setSelectedConsultant(consultant)
  }

  const handleStartConsultation = () => {
    setShowBookingModal(true)
  }

  // ✅ Show loading state during hydration to prevent mismatch
  if (!isClient || authLoading) {
    return (
      <div className="flex h-screen pt-16 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex h-screen pt-16">
      <div className="w-[380px] min-w-[380px] h-full border-r border-outline-variant/30 flex flex-col bg-surface-container">
        <div className="p-4 border-b border-outline-variant/30 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={() => router.push('/client/consultations')}
              variant="ghost"
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-on-surface">Chats</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search or start new chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {consultantsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredConsultants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-outline" />
              </div>
              <p className="text-on-surface-variant text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">Book a consultation to get started</p>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="mt-4 text-xs"
              >
                Find Consultants
              </Button>
            </div>
          ) : (
            filteredConsultants.map((c) => (
              <ConsultantListItem
                key={c.id}
                consultant={c}
                isSelected={selectedConsultant?.id === c.id}
                onClick={() => handleConsultantClick(c)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex-1">
        <ChatWindow
          consultant={selectedConsultant}
          messages={messages || []}
          isLoading={messagesLoading}
          hasOngoingConsultation={selectedConsultant?.has_ongoing_consultation || false}
          onStartConsultation={handleStartConsultation}
          totalConsultants={consultants?.length || 0}
        />
      </div>

      {showBookingModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30">
            <h3 className="text-xl font-bold text-on-surface mb-2">Start Consultation</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              with <span className="font-semibold text-on-surface">{selectedConsultant.first_name} {selectedConsultant.last_name}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                Select Duration
              </label>
              <div className="flex gap-2 flex-wrap">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setSelectedMinutes(mins)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedMinutes === mins
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-outline-variant/30 mb-4">
              <span className="text-sm font-semibold text-on-surface">Total</span>
              <span className="text-xl font-bold text-primary">
                ₹{selectedMinutes * selectedConsultant.per_minute_fee}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowBookingModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowBookingModal(false)
                  router.push(`/client/consultations/${selectedConsultant.id}`)
                }}
                variant="gradient"
                className="flex-1"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}