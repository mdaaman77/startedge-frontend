import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/lib/store/store'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      )
      if (refreshResult.data) {
        const { access_token, refresh_token } = refreshResult.data as any
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        result = await baseQuery(args, api, extraOptions)
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
  }
  return result
}

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Consultant', 'Consultation', 'Wallet'],
  endpoints: () => ({}),
})