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

export const consultantApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
})

export const {
  useListConsultantsQuery,
  useGetConsultantQuery,
} = consultantApi