'use client'

import { useState, useEffect } from 'react'
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
  const [login, { isLoading }] = useLoginMutation()
  const { getDashboardPath, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push(getDashboardPath())
    }
  }, [isAuthenticated, router, getDashboardPath])

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
      toast.success('Login successful!')
      const dashboardPath = getDashboardPath()
      router.push(dashboardPath)
    } catch (err: any) {
      toast.error(err.data?.detail || 'Login failed. Please check your credentials.')
    }
  }
const handleRedirect = () => {
  router.push("/"); 
};
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-surface-container-low relative overflow-hidden flex-col justify-between p-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-secondary-container/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10" onClick={handleRedirect} >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-on-primary-container" />
            </div>
            <span className="text-2xl font-black text-primary">StartEdge</span>
          </div>
        </div>

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
                <p className="text-sm text-on-surface-variant">Every consultant is thoroughly screened.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              </div>
              <div>
                <p className="font-semibold">End-to-End Encryption</p>
                <p className="text-sm text-on-surface-variant">Bank-grade security for all consultations.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              </div>
              <div>
                <p className="font-semibold">Instant Connectivity</p>
                <p className="text-sm text-on-surface-variant">Real-time matching with active experts.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative z-10 flex justify-between text-xs text-on-surface-variant">
          <span>© 2026 StartEdge Consultation Platform</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Panel */}
      <div className="w-full lg:w-[60%] bg-surface flex flex-col items-center justify-center p-6 md:p-8 relative">
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-on-primary-container" />
          </div>
          <span className="text-xl font-black text-primary">StartEdge</span>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-on-surface-variant">Enter your credentials to access your dashboard.</p>
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