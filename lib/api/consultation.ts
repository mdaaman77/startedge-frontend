import { api } from './client'

export interface Consultation {
  id: string
  client_id: string
  consultant_id: string
  requested_minutes: number
  per_minute_rate: number
  total_amount: number
  status:
  | 'requested'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'expired'
  | 'disputed'
  | 'refunded'
  started_at: string | null
  ended_at: string | null
  actual_minutes: number | null
  raised_issue: boolean
  issue_reason: string | null
  issue_resolved_by_admin: boolean | null
  created_at: string
  updated_at: string
  consultant?: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
    specialization_name: string
  }
  client?: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
  }
}

export interface ConsultationRequest {
  consultant_id: string
  requested_minutes: number
}

export interface ConsultationExtension {
  extra_minutes: number
}

export interface CompleteConsultationRequest {
  actual_minutes?: number
}

export interface ReviewAndIssueRequest {
  rating: number
  comment?: string
  raise_issue: boolean
  issue_reason?: string
}

export const consultationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyConsultations: builder.query<
      Consultation[],
      { status?: string; skip?: number; limit?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.status) searchParams.set('status', params.status)
        if (params.skip !== undefined) searchParams.set('skip', String(params.skip))
        if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
        return `/consultations/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      },
      providesTags: ['Consultation'],
    }),

    requestConsultation: builder.mutation<Consultation, ConsultationRequest>({
      query: (body) => ({
        url: '/consultations/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Consultation'],
    }),



    getRecentConsultants: builder.query<any[], void>({
  query: () => {
    console.log('🔵 Calling GET /consultations/recent-consultants')
    return '/consultations/recent-consultants'
  },
  providesTags: ['Consultant'],
}),

    getChatHistory: builder.query<any[], string>({
      query: (consultantId) => `/consultations/${consultantId}/chat-history`,
      providesTags: ['Consultation'],
    }),
  }),
})

export const {
  useGetMyConsultationsQuery,
  useRequestConsultationMutation,
  useGetRecentConsultantsQuery,
  useGetChatHistoryQuery,
} = consultationApi