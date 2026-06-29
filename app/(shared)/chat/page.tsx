'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MessageCircle, ArrowLeft } from 'lucide-react'
import { useConsultationTimer } from '@/hooks/useConsultationTimer'
import { useAuth } from '@/hooks/useAuth'
import {
    useGetRecentConsultantsQuery,
    useGetChatHistoryQuery,
    useRequestConsultationMutation,
    useGetRecentClientsQuery,
    useGetMyConsultationsQuery,
    useAcceptConsultationMutation,
    useRejectConsultationMutation,
    useExpireConsultationMutation,
} from '@/lib/api/consultation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { ChatListItem } from '@/components/chat/ChatListItem'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { BookingModal } from '@/components/consultations/BookingModal'
import toast from 'react-hot-toast'

type ConsultationStatus = 'idle' | 'requested' | 'accepted' | 'rejected' | 'expired'

export default function ChatPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [mounted, setMounted] = useState(false)

    const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(
        searchParams.get('consultant')
    )
    const [searchQuery, setSearchQuery] = useState('')
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedMinutes, setSelectedMinutes] = useState(15)
    const [isBooking, setIsBooking] = useState(false)
    const [consultationStatus, setConsultationStatus] = useState<ConsultationStatus>('idle')
    const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

    const isClient = user?.role === 'client'
    const isConsultant = user?.role === 'consultant'

    const { data: consultants, isLoading: consultantsLoading, refetch: refetchConsultants } =
        useGetRecentConsultantsQuery(undefined, {
            skip: !isAuthenticated || !isClient,
        })

    const { data: clients, isLoading: clientsLoading, refetch: refetchClients } =
        useGetRecentClientsQuery(undefined, {
            skip: !isAuthenticated || !isConsultant,
        })

    const {
        data: allConsultations,
        isLoading: isLoadingConsultations,
        refetch: refetchConsultations
    } = useGetMyConsultationsQuery(
        { limit: 100 },
        { skip: !isAuthenticated }
    )

    const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } =
        useGetChatHistoryQuery(
            selectedConsultantId || '',
            { skip: !selectedConsultantId }
        )

    const [requestConsultation] = useRequestConsultationMutation()
    const [acceptConsultation] = useAcceptConsultationMutation()
    const [rejectConsultation] = useRejectConsultationMutation()
    const [expireConsultation] = useExpireConsultationMutation()

    const listItems = isClient ? consultants : clients
    const isLoadingList = isClient ? consultantsLoading : clientsLoading

    const selectedUser = listItems?.find(
        (item) => item.id === selectedConsultantId
    )

    const hasActiveConsultation = selectedUser?.has_ongoing_consultation || false

    const hasPendingRequest = allConsultations?.some(
        c => c.consultant_id === selectedConsultantId && c.status === 'requested'
    ) || false

    const pendingRequest = allConsultations?.find(
        c => c.consultant_id === selectedConsultantId && c.status === 'requested'
    )

    const isConsultationRequested = consultationStatus === 'requested' || hasPendingRequest

    // ✅ Timer with expire API call
    const timer = useConsultationTimer({
        duration: 120,
        cooldownDuration: 60,
        onExpire: async () => {
            // ✅ API call happens IMMEDIATELY when timer hits 0
            if (pendingRequestId) {
                try {
                    await expireConsultation(pendingRequestId).unwrap()
                    toast.error('Consultation request expired')
                } catch (error) {
                    console.error('Failed to expire consultation:', error)
                }
            }
            setConsultationStatus('expired')
            setPendingRequestId(null)
            if (pollingInterval) {
                clearInterval(pollingInterval)
                setPollingInterval(null)
            }
            // Start cooldown after expire API call
            timer.startCooldown()
        },
        onCooldownComplete: () => {
            setConsultationStatus('idle')
            toast.success('You can now request a new consultation')
        },
    })

    const canStartConsultation = useMemo(() => {
        if (!selectedConsultantId || !isClient) return false
        if (timer.isCooldown) return false
        const existing = allConsultations?.some(
            c => c.consultant_id === selectedConsultantId &&
                ['requested', 'accepted', 'in_progress'].includes(c.status)
        )
        return !existing && selectedUser?.is_online === true
    }, [allConsultations, selectedConsultantId, isClient, selectedUser?.is_online, timer.isCooldown])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        const consultantId = searchParams.get('consultant')
        if (consultantId) {
            setSelectedConsultantId(consultantId)
        }
    }, [searchParams])

    useEffect(() => {
        if (selectedConsultantId && isAuthenticated) {
            refetchMessages()
            if (!isLoadingConsultations) {
                refetchConsultations()
            }
        }
    }, [selectedConsultantId, isAuthenticated, refetchMessages, refetchConsultations, isLoadingConsultations])

    // ✅ Check for expired consultation on mount
    useEffect(() => {
        if (allConsultations && selectedConsultantId) {
            const expired = allConsultations.find(
                c => c.consultant_id === selectedConsultantId && c.status === 'expired'
            )
            if (expired) {
                setConsultationStatus('expired')
                setPendingRequestId(null)
                if (pollingInterval) {
                    clearInterval(pollingInterval)
                    setPollingInterval(null)
                }
            }
        }
    }, [allConsultations, selectedConsultantId])

    // ✅ Polling for acceptance
    useEffect(() => {
        if (timer.isRunning && selectedConsultantId && isClient) {
            const interval = setInterval(async () => {
                try {
                    const result = await refetchConsultants()
                    const consultantsData = result.data || []
                    const found = consultantsData.find(
                        (item: any) => item.id === selectedConsultantId && item.has_ongoing_consultation === true
                    )
                    if (found) {
                        setConsultationStatus('accepted')
                        clearInterval(interval)
                        setPollingInterval(null)
                        timer.stop()
                        toast.success('Consultation accepted!')
                        setTimeout(() => {
                            router.push(`/chat?consultant=${selectedConsultantId}`)
                        }, 1500)
                    }
                } catch (error) {
                    console.error('Polling error:', error)
                }
            }, 3000)

            setPollingInterval(interval)
            return () => {
                if (interval) clearInterval(interval)
            }
        }
    }, [timer.isRunning, selectedConsultantId, isClient, refetchConsultants, router, timer])

    const handleConsultantClick = useCallback((id: string) => {
        setSelectedConsultantId(id)
        setConsultationStatus('idle')
        setPendingRequestId(null)
        timer.reset()
        if (pollingInterval) {
            clearInterval(pollingInterval)
            setPollingInterval(null)
        }
        router.push(`/chat?consultant=${id}`)
    }, [router, timer])

    const handleStartConsultation = useCallback(() => {
        if (timer.isCooldown) {
            toast.error(`Please wait ${timer.timeLeft}s before booking again`)
            return
        }
        setConsultationStatus('idle')
        setShowBookingModal(true)
    }, [timer.isCooldown, timer.timeLeft])

    const handleBookingConfirm = async (minutes: number) => {
        if (!selectedConsultantId) return
        if (timer.isCooldown) {
            toast.error(`Please wait ${timer.timeLeft}s before booking again`)
            return
        }

        setIsBooking(true)
        try {
            const result = await requestConsultation({
                consultant_id: selectedConsultantId,
                requested_minutes: minutes,
            }).unwrap()

            setPendingRequestId(result.id)
            toast.success('Consultation requested! Waiting for consultant to accept.')
            setShowBookingModal(false)
            setConsultationStatus('requested')
            timer.start()

            try {
                if (!isLoadingConsultations) {
                    await refetchConsultations()
                }
                await refetchConsultants()
                await refetchClients()
            } catch (refetchError) {
                console.debug('Refetch skipped or failed:', refetchError)
            }

        } catch (error: any) {
            let message = 'Failed to request consultation'
            if (error?.data?.detail) {
                if (typeof error.data.detail === 'string') {
                    message = error.data.detail
                } else if (Array.isArray(error.data.detail)) {
                    const details = error.data.detail.map((e: any) => e.msg || e.message || e)
                    message = details.join(', ')
                }
            } else if (error?.message) {
                message = error.message
            }
            toast.error(message)
            setConsultationStatus('idle')
            timer.startCooldown()
        } finally {
            setIsBooking(false)
        }
    }

    const handleAcceptRequest = async () => {
        if (!pendingRequest || !selectedConsultantId) return

        try {
            await acceptConsultation(pendingRequest.id).unwrap()
            toast.success('Consultation accepted!')
            setConsultationStatus('accepted')
            setPendingRequestId(null)
            timer.stop()
            router.push(`/chat?consultant=${selectedConsultantId}`)
        } catch (error: any) {
            toast.error(error?.data?.detail || 'Failed to accept')
        }
    }

    const handleRejectRequest = async () => {
        if (!pendingRequest) return

        try {
            await rejectConsultation(pendingRequest.id).unwrap()
            toast.success('Consultation rejected')
            setConsultationStatus('idle')
            setPendingRequestId(null)
            timer.reset()
            try {
                if (!isLoadingConsultations) {
                    await refetchConsultations()
                }
            } catch (refetchError) {
                console.debug('Refetch skipped or failed:', refetchError)
            }
        } catch (error: any) {
            toast.error(error?.data?.detail || 'Failed to reject')
        }
    }

    const filteredItems = listItems?.filter((item) =>
        `${item.first_name} ${item.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    )
        .sort((a, b) => {
            const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0
            const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0
            return timeB - timeA
        }) || []

    if (!mounted || authLoading) {
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
                            onClick={() => router.push(isClient ? '/' : '/consultant/dashboard')}
                            variant="ghost"
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h2 className="text-xl font-bold text-on-surface">
                            {isClient ? 'Chats' : 'Clients'}
                        </h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                        <input
                            type="text"
                            placeholder={isClient ? 'Search consultants...' : 'Search clients...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoadingList ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-outline" />
                            </div>
                            <p className="text-on-surface-variant text-sm font-medium">
                                No {isClient ? 'consultations' : 'clients'} yet
                            </p>
                            <p className="text-xs text-on-surface-variant/70 mt-1">
                                {isClient ? 'Book a consultation to get started' : 'Wait for clients to book'}
                            </p>
                            {isClient && (
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="outline"
                                    className="mt-4 text-xs"
                                >
                                    Find Consultants
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <ChatListItem
                                key={item.id}
                                id={item.id}
                                firstName={item.first_name}
                                lastName={item.last_name}
                                avatarUrl={item.avatar_url}
                                isOnline={item.is_online || false}
                                lastMessage={item.last_message}
                                lastMessageTime={item.last_message_time}
                                subtitle={isClient ? item.specialization_name : undefined}
                                isSelected={selectedConsultantId === item.id}
                                hasActiveConsultation={item.has_ongoing_consultation}
                                onClick={() => handleConsultantClick(item.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1">
                <ChatWindow
                    otherUser={selectedUser ? {
                        id: selectedUser.id,
                        first_name: selectedUser.first_name,
                        last_name: selectedUser.last_name,
                        avatar_url: selectedUser.avatar_url,
                        is_online: selectedUser.is_online || false,
                    } : null}
                    messages={messages || []}
                    isLoading={messagesLoading}
                    cooldownSeconds={timer.isCooldown ? timer.timeLeft : 0}
                    hasActiveConsultation={hasActiveConsultation}
                    isConsultationRequested={isConsultationRequested}
                    canStartConsultation={canStartConsultation}
                    onStartConsultation={handleStartConsultation}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                    userRole={isClient ? 'client' : 'consultant'}
                    totalConversations={listItems?.length || 0}
                    timerSeconds={timer.isRunning ? timer.timeLeft : 0}
                />
            </div>

            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onConfirm={handleBookingConfirm}
                consultantName={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}
                perMinuteFee={selectedUser?.per_minute_fee || 0}
                isLoading={isBooking}
            />
        </div>
    )
}