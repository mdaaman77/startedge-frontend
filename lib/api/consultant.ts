import { api } from './client'

export interface Consultant {
  id: string
  user_id: string
  category: string
  specialization_id: string | null
  specialization_name: string | null
  per_minute_fee: number
  is_online: boolean
  average_rating: number
  total_reviews: number
  experience_years: number | null
  bio: string | null
  first_name: string
  last_name: string
  avatar_url: string
}

export interface ConsultantProfileResponse {
  id: string
  user_id: string
  category: string
  specialization_id: string | null
  specialization_name: string | null
  experience_years: number | null
  per_minute_fee: number
  is_online: boolean
  average_rating: number
  total_reviews: number
  bio: string | null
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

export type ConsultantProfileUpdate = {
  category?: string
  specialization_id?: string | null
  experience_years?: number | null
  per_minute_fee?: number | null
  bio?: string | null
}

export interface ConsultantListParams {
  search?: string
  category?: string
  specialization_id?: string
  min_experience?: number
  max_fee?: number
  is_online?: boolean
  min_rating?: number
  sort_by?: 'rating' | 'fee' | 'experience'
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
}

export interface ConsultantRequestCreate {
  about_yourself: string
  why_consultant: string
  category: string
  specialization_id: string | null
  experience_years: number | null
  per_minute_fee: number
  linkedin_url?: string | null
  resume_url?: string | null
}

export interface ConsultantRequestResponse {
  id: string
  user_id: string
  about_yourself: string | null
  why_consultant: string | null
  category: string
  specialization_id: string | null
  specialization_name: string | null
  experience_years: number | null
  per_minute_fee: number
  linkedin_url: string | null
  resume_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | 'No reason Given'
  blocked_until: string | null
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

export const consultantApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // --- Existing Endpoints ---
    listConsultants: builder.query<Consultant[], ConsultantListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.search) searchParams.set('search', params.search)
        if (params.category) searchParams.set('category', params.category)
        if (params.specialization_id) searchParams.set('specialization_id', params.specialization_id)
        if (params.min_experience !== undefined) searchParams.set('min_experience', String(params.min_experience))
        if (params.max_fee !== undefined) searchParams.set('max_fee', String(params.max_fee))
        if (params.is_online !== undefined) searchParams.set('is_online', String(params.is_online))
        if (params.min_rating !== undefined) searchParams.set('min_rating', String(params.min_rating))
        if (params.sort_by) searchParams.set('sort_by', params.sort_by)
        if (params.order) searchParams.set('order', params.order)
        if (params.skip !== undefined) searchParams.set('skip', String(params.skip))
        if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
        
        const queryString = searchParams.toString()
        return `/consultants/${queryString ? `?${queryString}` : ''}`
      },
      providesTags: ['Consultant'],
    }),
    
    getConsultant: builder.query<Consultant, string>({
      query: (id) => `/consultants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Consultant', id }],
    }),

    // --- Consultant Profile Endpoints ---
    getMyProfile: builder.query<ConsultantProfileResponse, void>({
      query: () => '/consultants/me',
      providesTags: ['ConsultantProfile'],
    }),

    updateConsultantProfile: builder.mutation<ConsultantProfileResponse, ConsultantProfileUpdate>({
      query: (body) => ({
        url: '/consultants/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ConsultantProfile'],
    }),

    toggleOnline: builder.mutation<{ is_online: boolean; message: string }, { is_online: boolean }>({
      query: ({ is_online }) => ({
        url: `/consultants/me/toggle-online?is_online=${is_online}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ConsultantProfile'],
    }),

    // --- Consultant Request Endpoints ---
    applyForConsultant: builder.mutation<ConsultantRequestResponse, ConsultantRequestCreate>({
      query: (body) => ({
        url: '/consultants/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ConsultantRequest'],
    }),

    getMyConsultantRequest: builder.query<ConsultantRequestResponse | null, void>({
      query: () => '/consultants/request/me',
      providesTags: ['ConsultantRequest'],
      
      transformResponse: (response: ConsultantRequestResponse) => {
        return response
      },
      transformErrorResponse: (response) => {
        if (response.status === 404) {
          return null
        }
        return response
      },
    }),
  }),
})

export const {
  useListConsultantsQuery,
  useGetConsultantQuery,
  useGetMyProfileQuery,
  useUpdateConsultantProfileMutation,
  useToggleOnlineMutation,
  useApplyForConsultantMutation,
  useGetMyConsultantRequestQuery,
} = consultantApi