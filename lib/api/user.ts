import { api } from './client'
import type { User } from '@/types/user'

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  phone?: string | null
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
  confirm_password: string  // ✅ Add this
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => {
        const requestBody: Record<string, string | null> = {}
        
        if (body.first_name !== undefined && body.first_name !== '') {
          requestBody.first_name = body.first_name
        }
        if (body.last_name !== undefined && body.last_name !== '') {
          requestBody.last_name = body.last_name
        }
        if (body.phone !== undefined && body.phone !== '') {
          requestBody.phone = body.phone
        }
        
        return {
          url: '/users/me',
          method: 'PATCH',
          body: requestBody,
        }
      },
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: '/users/change-password',
        method: 'POST',
        body: {
          old_password: body.old_password,
          new_password: body.new_password,
          confirm_password: body.confirm_password,  // ✅ Send this
        },
      }),
    }),
  }),
})

export const { useUpdateProfileMutation, useChangePasswordMutation } = userApi