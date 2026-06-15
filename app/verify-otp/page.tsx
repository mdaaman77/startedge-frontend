'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useVerifyOTPMutation, useResendOTPMutation } from '@/lib/api/auth'
import { Key, RefreshCw, CheckCircle, XCircle, Rocket } from 'lucide-react'

export default function VerifyOTPPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const [verifyOTP] = useVerifyOTPMutation()
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail')
    if (!storedEmail) {
      router.push('/register')
      return
    }
    setEmail(storedEmail)
  }, [router])

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer, canResend])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Animate the input and auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('')
      const newOtp = [...otp]
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit
      })
      setOtp(newOtp)
      if (digits.length === 6) {
        inputRefs.current[5]?.focus()
      }
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP')
      return
    }

    setVerifyStatus('verifying')
    try {
      await verifyOTP({ email, otp_code: otpCode }).unwrap()
      setVerifyStatus('success')
      toast.success('Email verified successfully!')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setVerifyStatus('error')
      toast.error(err.data?.detail || 'Invalid OTP. Please try again.')
      setTimeout(() => setVerifyStatus('idle'), 2000)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return
    try {
      await resendOTP({ email }).unwrap()
      toast.success('OTP resent successfully!')
      setTimer(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      setVerifyStatus('idle')
      // Focus first input after resend
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } catch (err: any) {
      toast.error(err.data?.detail || 'Failed to resend OTP. Please try again.')
    }
  }

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex"
    >
      {/* Left Panel - Brand Panel (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-surface-container-low relative overflow-hidden flex-col justify-between p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-secondary-container/10 rounded-full blur-[80px]"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-on-primary-container" />
            </div>
            <span className="text-2xl font-black text-primary">StartEdge</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-bold mb-8 leading-tight">
            Verify Your<br />
            <span className="gradient-text">Email Address</span>
          </h1>
          <p className="text-on-surface-variant">We've sent a 6-digit verification code to your email. Enter it below to complete your registration.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative z-10 flex justify-between text-xs text-on-surface-variant"
        >
          <span>© 2024 StartEdge Consultation Platform</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </motion.div>

        {/* Floating Decorative Cards */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass-panel absolute right-10 top-[20%] p-3 rounded-xl w-44 animate-float"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-secondary-container"></div>
              <div className="h-2 w-16 bg-outline-variant rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-outline-variant/30 rounded"></div>
              <div className="h-2 w-3/4 bg-outline-variant/30 rounded"></div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass-panel absolute right-[-20px] top-[45%] p-3 rounded-xl w-56 animate-float-delay-1"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="h-2 w-20 bg-primary-container rounded"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary"></div>
            </div>
            <div className="h-12 w-full bg-outline-variant/20 rounded-lg"></div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - OTP Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-[60%] bg-surface flex flex-col items-center justify-center p-6 md:p-8 relative"
      >
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-on-primary-container" />
          </div>
          <span className="text-xl font-black text-primary">StartEdge</span>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto mb-4"
            >
              <Key className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">Verify OTP</h2>
            <p className="text-on-surface-variant">
              Enter the 6-digit code sent to <span className="text-primary font-semibold">{email}</span>
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* OTP Input Boxes with Stagger Animation */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="flex justify-center gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.8 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileFocus={{ scale: 1.05, boxShadow: '0 0 0 2px rgba(128, 131, 255, 0.4)' }}
                  animate={
                    verifyStatus === 'error'
                      ? { x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.4 } }
                      : {}
                  }
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-surface-container-high border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                  autoFocus={index === 0}
                  disabled={verifyStatus === 'verifying' || verifyStatus === 'success'}
                />
              ))}
            </motion.div>

            {/* Status Animation with Framer Motion */}
            <AnimatePresence mode="wait">
              {verifyStatus === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full"
                  />
                </motion.div>
              )}

              {verifyStatus === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-tertiary-container/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-tertiary" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-tertiary font-semibold"
                  >
                    Verified! Redirecting...
                  </motion.p>
                </motion.div>
              )}

              {verifyStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center"
                  >
                    <XCircle className="w-10 h-10 text-error" />
                  </motion.div>
                  <p className="text-error font-semibold">Invalid OTP. Please try again.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={otp.join('').length !== 6 || verifyStatus === 'verifying' || verifyStatus === 'success'}
              className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {verifyStatus === 'verifying' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : verifyStatus === 'success' ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  Verified <CheckCircle size={18} />
                </motion.span>
              ) : (
                'Verify OTP'
              )}
            </motion.button>

            {/* Resend Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendOTP}
                disabled={!canResend || isResending}
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 text-sm"
              >
                {isResending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                  />
                ) : (
                  <>
                    <RefreshCw size={16} />
                    {canResend ? 'Resend OTP' : `Resend OTP in ${timer}s`}
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}