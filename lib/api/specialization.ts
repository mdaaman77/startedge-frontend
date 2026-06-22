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
      query: () => '/specializations',
      providesTags: ['Specialization'],
    }),
  }),
})

export const { useListSpecializationsQuery } = specializationApi