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

export interface RecentClient {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  last_message: string | null
  last_message_time: string | null
  has_ongoing_consultation: boolean
  ongoing_consultation_id: string | null
}

export const consultationApi = api.injectEndpoints({
  overrideExisting: true,
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

    acceptConsultation: builder.mutation<Consultation, string>({
      query: (id) => ({
        url: `/consultations/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Consultation'],
    }),

    rejectConsultation: builder.mutation<Consultation, string>({
      query: (id) => ({
        url: `/consultations/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Consultation'],
    }),

    expireConsultation: builder.mutation<Consultation, string>({
      query: (id) => ({
        url: `/consultations/${id}/expire`,
        method: 'POST',
      }),
      invalidatesTags: ['Consultation'],
    }),

    extendConsultation: builder.mutation<Consultation, { id: string; extra_minutes: number }>({
      query: ({ id, extra_minutes }) => ({
        url: `/consultations/${id}/extend`,
        method: 'POST',
        body: { extra_minutes },
      }),
      invalidatesTags: ['Consultation'],
    }),

    completeConsultation: builder.mutation<Consultation, { id: string; actual_minutes?: number }>({
      query: ({ id, actual_minutes }) => ({
        url: `/consultations/${id}/complete`,
        method: 'POST',
        body: { actual_minutes },
      }),
      invalidatesTags: ['Consultation'],
    }),

    getRecentConsultants: builder.query<any[], void>({
      query: () => '/consultations/recent-consultants',
      providesTags: ['Consultant'],
    }),

    getRecentClients: builder.query<RecentClient[], void>({
      query: () => '/consultations/recent-clients',
      providesTags: ['Consultant'],
    }),

    getChatHistory: builder.query<any[], string>({
      query: (consultantId) => `/consultations/${consultantId}/chat-history`,
      providesTags: ['Consultation'],
    }),

    getIncomingRequests: builder.query<Consultation[], void>({
      query: () => '/consultations/incoming',
      providesTags: ['Consultation'],
    }),
  }),
})

export const {
  useGetMyConsultationsQuery,
  useRequestConsultationMutation,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useExpireConsultationMutation,  
  useExtendConsultationMutation,
  useCompleteConsultationMutation,
  useGetRecentConsultantsQuery,
  useGetRecentClientsQuery,
  useGetChatHistoryQuery,
  useGetIncomingRequestsQuery,
} = consultationApi