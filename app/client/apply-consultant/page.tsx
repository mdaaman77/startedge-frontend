'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Calendar, CheckCircle, XCircle, Loader2, ArrowLeft, User, Briefcase, Clock, DollarSign, Link as LinkIcon, FileText } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useApplyForConsultantMutation, useGetMyConsultantRequestQuery } from '@/lib/api/consultant'
import { useListSpecializationsQuery } from '@/lib/api/specialization'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// --- Form Schema ---
const applySchema = z.object({
  about_yourself: z.string().min(2, 'Minimum 2 characters').max(2000, 'Maximum 2000 characters'),
  why_consultant: z.string().min(2, 'Minimum 2 characters').max(2000, 'Maximum 2000 characters'),
  category: z.string().min(1, 'Category is required'),
  specialization_id: z.string().nullable(),
  experience_years: z.number().min(0, 'Minimum 0').max(60, 'Maximum 60').nullable(),
  per_minute_fee: z.number().min(10, 'Minimum ₹10 per minute').max(10000, 'Maximum ₹10,000 per minute'),
  linkedin_url: z.string().url('Invalid URL').nullable().optional(),
  resume_url: z.string().url('Invalid URL').nullable().optional(),
})

type ApplyFormData = z.infer<typeof applySchema>

// --- Status Display Component ---
function ApplicationStatus({ status, rejectionReason, blockedUntil, createdAt }: {
  status: string
  rejectionReason?: string | null
  blockedUntil?: string | null
  createdAt: string
}) {
  const isPending = status === 'pending'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

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
                Submitted on: <span className="text-on-surface font-medium">
                  {new Date(createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
            {rejectionReason && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Reason:</span> {rejectionReason}
                </p>
              </div>
            )}
            {blockedUntil && new Date(blockedUntil) > new Date() && (
              <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm text-on-surface-variant">
                  You can apply again on:{' '}
                  <span className="text-on-surface font-semibold">
                    {new Date(blockedUntil).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </span>
              </div>
            )}
            <Button
              onClick={() => window.location.href = '/client/dashboard'}
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

  // Fetch existing application
  const { data: existingRequest, isLoading: requestLoading, refetch } = useGetMyConsultantRequestQuery(undefined, {
    skip: !isAuthenticated,
  })

  // Fetch specializations
  const { data: specializations, isLoading: specsLoading } = useListSpecializationsQuery()

  // Apply mutation
  const [applyForConsultant] = useApplyForConsultantMutation()

  // --- Form Setup ---
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
      linkedin_url: null,
      resume_url: null,
    },
  })

  // --- Redirect if not client ---
  useEffect(() => {
    if (!authLoading) {
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
  }, [authLoading, isAuthenticated, user, router])

  // --- Handle Submit ---
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
    } catch (error: any) {
      console.error('Apply error:', error)
      let errorMessage = 'Failed to submit application'
      if (error?.data?.detail) {
        errorMessage = error.data.detail
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Loading States ---
  if (authLoading || requestLoading) {
    return <LoadingSpinner />
  }

  // --- Show existing application status ---
  if (existingRequest) {
    // Check if rejected and blocked
    let blockedUntil = null
    if (existingRequest.status === 'rejected' && user?.consultant_request_blocked_until) {
      blockedUntil = user.consultant_request_blocked_until
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

  // --- Show success state ---
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
          <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30 text-center">
            <div className="w-20 h-20 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-tertiary" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Application Submitted!</h2>
            <p className="text-on-surface-variant mb-6">
              Your application has been submitted successfully. Our admin team will review it and notify you via email.
            </p>
            <Button
              onClick={() => router.push('/client/dashboard')}
              variant="gradient"
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // --- Show Application Form ---
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
          {/* About Yourself */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              About Yourself <span className="text-error">*</span>
            </label>
            <textarea
              {...register('about_yourself')}
              rows={4}
              placeholder="Tell us about your background, expertise, and qualifications..."
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            {errors.about_yourself && (
              <p className="text-error text-xs mt-1">{errors.about_yourself.message}</p>
            )}
          </div>

          {/* Why Consultant */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Why do you want to become a consultant? <span className="text-error">*</span>
            </label>
            <textarea
              {...register('why_consultant')}
              rows={3}
              placeholder="Explain your motivation for becoming a consultant..."
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            {errors.why_consultant && (
              <p className="text-error text-xs mt-1">{errors.why_consultant.message}</p>
            )}
          </div>

          {/* Category & Specialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Category <span className="text-error">*</span>
              </label>
              <input
                {...register('category')}
                placeholder="e.g. healthcare"
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
              {errors.category && (
                <p className="text-error text-xs mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Specialization
              </label>
              <select
                {...register('specialization_id')}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select Specialization</option>
                {specsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  specializations?.map((spec: any) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))
                )}
              </select>
              {errors.specialization_id && (
                <p className="text-error text-xs mt-1">{errors.specialization_id.message}</p>
              )}
            </div>
          </div>

          {/* Experience & Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Experience (years)
              </label>
              <input
                type="number"
                {...register('experience_years', { valueAsNumber: true })}
                placeholder="0"
                min={0}
                max={60}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
              {errors.experience_years && (
                <p className="text-error text-xs mt-1">{errors.experience_years.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Per Minute Fee (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                {...register('per_minute_fee', { valueAsNumber: true })}
                placeholder="50"
                min={10}
                max={10000}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
              {errors.per_minute_fee && (
                <p className="text-error text-xs mt-1">{errors.per_minute_fee.message}</p>
              )}
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              LinkedIn URL (optional)
            </label>
            <input
              {...register('linkedin_url')}
              placeholder="https://linkedin.com/in/your-profile"
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            {errors.linkedin_url && (
              <p className="text-error text-xs mt-1">{errors.linkedin_url.message}</p>
            )}
          </div>

          {/* Resume URL */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Resume URL (optional)
            </label>
            <input
              {...register('resume_url')}
              placeholder="https://example.com/resume.pdf"
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            {errors.resume_url && (
              <p className="text-error text-xs mt-1">{errors.resume_url.message}</p>
            )}
          </div>

          {/* Submit Button */}
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