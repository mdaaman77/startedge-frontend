'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Calendar, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useApplyForConsultantMutation, useGetMyConsultantRequestQuery } from '@/lib/api/consultant'
import { useListSpecializationsQuery } from '@/lib/api/specialization'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

// --- Form Schema ---
const applySchema = z.object({
  about_yourself: z.string().min(2, 'Minimum 2 characters').max(2000, 'Maximum 2000 characters'),
  why_consultant: z.string().min(2, 'Minimum 2 characters').max(2000, 'Maximum 2000 characters'),
  category: z.string().min(1, 'Category is required'),
  specialization_id: z.string().nullable(),
  experience_years: z.number().min(0, 'Minimum 0').max(60, 'Maximum 60').nullable(),
  per_minute_fee: z.number().min(10, 'Minimum ₹10 per minute').max(10000, 'Maximum ₹10,000 per minute'),
  linkedin_url: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      return val
    },
    z.string().url('Please enter a valid LinkedIn URL').nullable().optional()
  ),
  resume_url: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      return val
    },
    z.string().url('Please enter a valid resume URL').nullable().optional()
  ),
})

type ApplyFormData = z.infer<typeof applySchema>

// --- Status Display Component ---
function ApplicationStatus({ 
  status, 
  rejectionReason, 
  blockedUntil, 
  createdAt 
}: {
  status: string
  rejectionReason?: string | null
  blockedUntil?: string | null
  createdAt: string
}) {
  const isPending = status === 'pending'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'
  
  const isBlocked = blockedUntil && typeof blockedUntil === 'string' && new Date(blockedUntil) > new Date()

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return date
    }
  }
  

  return (
    <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30">
      <div className="text-center">
        {isPending && (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2">Application Under Review</h3>
            <p className="text-on-surface-variant">
              Your application is being reviewed by our admin team.
              You will be notified via email once a decision is made.
            </p>
            <div className="mt-6 p-4 bg-surface-container-low rounded-lg">
              <p className="text-sm text-on-surface-variant">
                Submitted on:{' '}
                <span className="text-on-surface font-medium">
                  {formatDate(createdAt)}
                </span>
              </p>
            </div>
          </>
        )}

        {isApproved && (
          <>
            <div className="w-20 h-20 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-tertiary" />
            </div>
            <h3 className="text-2xl font-bold text-tertiary mb-2">Application Approved! 🎉</h3>
            <p className="text-on-surface-variant">
              Congratulations! You are now a verified consultant on StartEdge.
              Complete your profile and start accepting consultations.
            </p>
            <Button
              onClick={() => window.location.href = '/consultant/dashboard'}
              className="mt-6"
              variant="gradient"
            >
              Go to Consultant Dashboard
            </Button>
          </>
        )}

        {isRejected && (
          <>
            <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-error" />
            </div>
            <h3 className="text-2xl font-bold text-error mb-2">Application Rejected</h3>
            
            {rejectionReason && rejectionReason !== 'No reason Given' && rejectionReason !== '' && rejectionReason !== 'null' ? (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Reason:</span> {rejectionReason}
                </p>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm mb-4">
                Your application was not approved at this time.
              </p>
            )}
            
            {isBlocked ? (
              <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm text-on-surface-variant">
                  You can apply again on:{' '}
                  <span className="text-on-surface font-semibold">
                    {formatDate(blockedUntil)}
                  </span>
                </span>
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-sm text-on-surface-variant">
                  You can apply again after 30 days from rejection.
                </p>
              </div>
            )}
            
            <Button
              onClick={() => window.location.href = '/'}
              className="mt-6"
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// --- Main Page ---
export default function ApplyConsultantPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)  

  useEffect(() => {
    setMounted(true)
  }, [])

  const { 
    data: existingRequest, 
    isLoading: requestLoading, 
    error: requestError,
    refetch 
  } = useGetMyConsultantRequestQuery(undefined, {
    skip: !isAuthenticated || !mounted,
  })

  useEffect(() => {
    if (isAuthenticated && mounted) {
      refetch()
    }
  }, [isAuthenticated, mounted, refetch])

  useEffect(() => {
    if (existingRequest) {
      console.log('✅ Existing request data:', existingRequest)
    }
    if (requestError) {
      console.log('❌ Error fetching request:', requestError)
    }
  }, [existingRequest, requestError])

  const { data: specializations, isLoading: specsLoading } = useListSpecializationsQuery()
  const [applyForConsultant] = useApplyForConsultantMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      category: 'healthcare',
      specialization_id: null,
      experience_years: null,
      per_minute_fee: 50,
      linkedin_url: '',
      resume_url: '',
    },
  })

  useEffect(() => {
    if (!authLoading && mounted) {
      if (!isAuthenticated) {
        router.push('/login?from=/client/apply-consultant')
        return
      }
      if (user?.role === 'consultant') {
        router.push('/consultant/dashboard')
        return
      }
      if (user?.role === 'admin') {
        router.push('/admin/dashboard')
        return
      }
    }
  }, [authLoading, isAuthenticated, user, router, mounted])

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true)
    try {
      await applyForConsultant({
        ...data,
        specialization_id: data.specialization_id || null,
        experience_years: data.experience_years || null,
      }).unwrap()

      setSubmitSuccess(true)
      toast.success('Application submitted successfully!')
      await refetch()
      reset()
      
    } catch (error: unknown) {
      console.error('❌ Apply error:', error)
      let errorMessage = 'Failed to submit application'
      
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { detail?: string | Array<{ msg: string }> }
        if (errorData?.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: { msg: string }) => e.msg).join(', ')
          }
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
      </div>
    )
  }

  if (authLoading || requestLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (existingRequest) {
    const blockedUntil = existingRequest.blocked_until || null

    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-3xl font-bold text-on-surface mb-2">Consultant Application</h1>
          <p className="text-on-surface-variant mb-8">View the status of your application</p>

          <ApplicationStatus
            status={existingRequest.status}
            rejectionReason={existingRequest.rejection_reason}
            blockedUntil={blockedUntil}
            createdAt={existingRequest.created_at}
          />
        </main>
        <Footer />
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
          <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30 text-center">
            <div className="w-20 h-20 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-tertiary" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Application Submitted! 🎉</h2>
            <p className="text-on-surface-variant mb-6">
              Your application has been submitted successfully. Our admin team will review it 
              and notify you via email. You can check the status here anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="gradient"
              >
                Check Status
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-on-surface mb-2">Apply as Consultant</h1>
        <p className="text-on-surface-variant mb-8">
          Fill in the details below to apply for becoming a consultant on StartEdge.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ... form fields ... */}
          <Button
            type="submit"
            variant="gradient"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>

          <p className="text-xs text-on-surface-variant text-center">
            Your application will be reviewed by our admin team. You will be notified via email.
          </p>
        </form>
      </main>
      <Footer />
    </div>
  )
}