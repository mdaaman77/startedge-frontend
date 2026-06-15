export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: 'client' | 'consultant' | 'admin'
  wallet_balance: number
  is_verified: boolean
  is_suspended: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
}

export interface OTPVerifyRequest {
  email: string
  otp_code: string
}

export interface OTPResendRequest {
  email: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}