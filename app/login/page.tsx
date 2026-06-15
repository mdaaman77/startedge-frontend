'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useLoginMutation } from '@/lib/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Rocket } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'client' | 'consultant'>('client')
  const [login, { isLoading }] = useLoginMutation()
  const { getDashboardPath } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap()
      toast.success('Login successful! Redirecting...')
      setTimeout(() => {
        router.push(getDashboardPath())
      }, 1500)
    } catch (err: any) {
      toast.error(err.data?.detail || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Panel (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-surface-container-low relative overflow-hidden flex-col justify-between p-8">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-secondary-container/10 rounded-full blur-[80px]"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-on-primary-container" />
            </div>
            <span className="text-2xl font-black text-primary">StartEdge</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-8 leading-tight">
            Expert Advice,<br />
            <span className="gradient-text">Just a Click Away.</span>
          </h1>
          
          <ul className="space-y-6">
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              </div>
              <div>
                <p className="font-semibold">Vetted Professionals</p>
                <p className="text-sm text-on-surface-variant">Every consultant is thoroughly screened for legal and corporate compliance.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              </div>
              <div>
                <p className="font-semibold">End-to-End Encryption</p>
                <p className="text-sm text-on-surface-variant">Your consultations and sensitive data are protected with bank-grade security.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              </div>
              <div>
                <p className="font-semibold">Instant Connectivity</p>
                <p className="text-sm text-on-surface-variant">Real-time matching with active experts for high-stakes decision making.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between text-xs text-on-surface-variant">
          <span>© 2024 StartEdge Consultation Platform</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>

        {/* Floating Cards Decoration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
          <div className="glass-panel absolute right-10 top-[20%] p-3 rounded-xl w-44 animate-float">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-secondary-container"></div>
              <div className="h-2 w-16 bg-outline-variant rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-outline-variant/30 rounded"></div>
              <div className="h-2 w-3/4 bg-outline-variant/30 rounded"></div>
            </div>
          </div>
          <div className="glass-panel absolute right-[-20px] top-[45%] p-3 rounded-xl w-56 animate-float-delay-1">
            <div className="flex justify-between items-center mb-2">
              <div className="h-2 w-20 bg-primary-container rounded"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary"></div>
            </div>
            <div className="h-12 w-full bg-outline-variant/20 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Panel (60%) */}
      <div className="w-full lg:w-[60%] bg-surface flex flex-col items-center justify-center p-6 md:p-8 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-on-primary-container" />
          </div>
          <span className="text-xl font-black text-primary">StartEdge</span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-on-surface-variant">Enter your credentials to access your dashboard.</p>
          </div>

          {/* Role Selector */}
          <div className="bg-surface-container-high p-1 rounded-xl flex items-center mb-6">
            <button
              onClick={() => setRole('client')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === 'client'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => setRole('consultant')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === 'consultant'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Consultant
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant bg-surface-container-high" />
              <label htmlFor="remember" className="text-sm text-on-surface-variant">Remember this device</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'Log In to StartEdge'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-surface px-4 text-on-surface-variant">Or continue with</span>
            </div>
          </div>

          <button
            disabled
            className="w-full py-3 bg-surface-container-high border border-outline-variant rounded-xl text-on-surface-variant font-medium flex items-center justify-center gap-3 opacity-60 cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google (Phase 2)
          </button>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            
            Dont have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}