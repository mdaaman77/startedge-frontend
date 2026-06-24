import { api } from './client'

export interface Specialization {
  id: string
  name: string
  description: string | null
  created_at: string
}

export const specializationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listSpecializations: builder.query<Specialization[], void>({
      query: () => ({
        url: '/specializations',
        method: 'GET',
      }),
      providesTags: ['Specialization'],
      
      transformResponse: (response: any) => {
        // If response is an object with data property, extract it
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          if (response.data && Array.isArray(response.data)) {
            return response.data
          }
          // If response is an object with specializations property
          if (response.specializations && Array.isArray(response.specializations)) {
            return response.specializations
          }
        }
        // If response is already an array, return it
        if (Array.isArray(response)) {
          return response
        }
        // Fallback: return empty array
        return []
      },
    }),
  }),
})

export const { useListSpecializationsQuery } = specializationApi