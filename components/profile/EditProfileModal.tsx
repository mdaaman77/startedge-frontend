'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Briefcase, Clock, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/lib/api/user'
import {
  useGetMyProfileQuery,
  useUpdateConsultantProfileMutation,
} from '@/lib/api/consultant'
import { useListSpecializationsQuery } from '@/lib/api/specialization'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
})

const consultantProfileSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  specialization_id: z.string().nullable().optional(),
  experience_years: z.number().min(0, 'Minimum 0').max(60, 'Maximum 60').nullable().optional(),
  per_minute_fee: z.number().min(10, 'Minimum ₹10').max(10000, 'Maximum ₹10,000').nullable().optional(),
  bio: z.string().max(2000, 'Maximum 2000 characters').nullable().optional(),
})

const passwordSchema = z
  .object({
    old_password: z.string().min(8, 'Password must be at least 8 characters'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type ProfileFormData = z.infer<typeof profileSchema>
type ConsultantProfileFormData = z.infer<typeof consultantProfileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdate?: () => void
}

export function EditProfileModal({ isOpen, onClose, onProfileUpdate }: EditProfileModalProps) {
  const { user, refetch } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConsultant = user?.role === 'consultant'

  const { data: profile, refetch: refetchProfile } = useGetMyProfileQuery(undefined, {
    skip: !isConsultant,
  })

  const { data: specializations } = useListSpecializationsQuery(undefined, {
    skip: !isConsultant,
  })

  const [updateProfile] = useUpdateProfileMutation()
  const [changePassword] = useChangePasswordMutation()
  const [updateConsultantProfile] = useUpdateConsultantProfileMutation()

  const {
    register: registerProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    watch: watchProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  })

  const {
    register: registerConsultant,
    formState: { errors: consultantErrors },
    reset: resetConsultant,
  } = useForm<ConsultantProfileFormData>({
    resolver: zodResolver(consultantProfileSchema),
    defaultValues: {
      category: profile?.category || 'healthcare',
      specialization_id: profile?.specialization_id || null,
      experience_years: profile?.experience_years || null,
      per_minute_fee: profile?.per_minute_fee || null,
      bio: profile?.bio || '',
    },
  })

  const {
    register: registerPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
      })
    }
  }, [user, resetProfile])

  useEffect(() => {
    if (profile && isConsultant) {
      resetConsultant({
        category: profile.category || 'healthcare',
        specialization_id: profile.specialization_id || null,
        experience_years: profile.experience_years || null,
        per_minute_fee: profile.per_minute_fee || null,
        bio: profile.bio || '',
      })
    }
  }, [profile, isConsultant, resetConsultant])

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.data?.detail) {
      if (Array.isArray(error.data.detail)) {
        return error.data.detail.map((e: any) => e.msg || e.message).join(', ')
      }
      if (typeof error.data.detail === 'string') {
        return error.data.detail
      }
    }
    if (error?.data?.message) return error.data.message
    if (error?.error) return error.error
    return 'An error occurred. Please try again.'
  }

  const onSubmit = async () => {
    const profileData = watchProfile()
    const passwordData = watchPassword()

    const profileChanges: Record<string, string | null> = {}
    if (profileData.first_name && profileData.first_name !== user?.first_name) {
      profileChanges.first_name = profileData.first_name
    }
    if (profileData.last_name && profileData.last_name !== user?.last_name) {
      profileChanges.last_name = profileData.last_name
    }
    if (profileData.phone !== undefined && profileData.phone !== user?.phone) {
      profileChanges.phone = profileData.phone?.trim() === '' ? null : profileData.phone
    }

    const hasProfileChanges = Object.keys(profileChanges).length > 0
    const hasPasswordChanges = !!(
      passwordData.old_password &&
      passwordData.new_password &&
      passwordData.confirm_password
    )

    let hasConsultantChanges = false
    let consultantChanges: any = {}

    if (isConsultant) {
      const consultantData = registerConsultant._formValues || {}
      consultantChanges = {
        category: consultantData.category !== profile?.category ? consultantData.category : undefined,
        specialization_id: consultantData.specialization_id !== profile?.specialization_id 
          ? consultantData.specialization_id 
          : undefined,
        experience_years: consultantData.experience_years !== profile?.experience_years
          ? consultantData.experience_years
          : undefined,
        per_minute_fee: consultantData.per_minute_fee !== profile?.per_minute_fee
          ? consultantData.per_minute_fee
          : undefined,
        bio: consultantData.bio !== profile?.bio ? consultantData.bio : undefined,
      }
      hasConsultantChanges = Object.values(consultantChanges).some(v => v !== undefined)
    }

    if (!hasProfileChanges && !hasPasswordChanges && !hasConsultantChanges) {
      toast('No changes to save', { icon: 'ℹ️' })
      onClose()
      return
    }

    setIsSubmitting(true)

    try {
      if (hasProfileChanges) {
        await updateProfile(profileChanges).unwrap()
      }

      if (hasConsultantChanges && isConsultant) {
        await updateConsultantProfile(consultantChanges).unwrap()
        await refetchProfile()
      }

      if (hasPasswordChanges) {
        await changePassword({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password,
        }).unwrap()
      }

      toast.success('Profile updated successfully')
      await refetch()
      resetPassword()
      if (onProfileUpdate) onProfileUpdate()
      onClose()
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-surface-container rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-outline-variant/30 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <h2 className="text-xl font-bold text-on-surface">Edit Profile</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        First Name
                      </label>
                      <Input
                        {...registerProfile('first_name')}
                        icon={<User size={18} />}
                        placeholder="John"
                        error={profileErrors.first_name?.message}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Last Name
                      </label>
                      <Input
                        {...registerProfile('last_name')}
                        icon={<User size={18} />}
                        placeholder="Doe"
                        error={profileErrors.last_name?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Email
                    </label>
                    <Input
                      value={user?.email}
                      disabled
                      icon={<Mail size={18} />}
                      className="opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Phone (optional)
                    </label>
                    <Input
                      {...registerProfile('phone')}
                      icon={<Phone size={18} />}
                      placeholder="9876543210"
                      error={profileErrors.phone?.message}
                    />
                  </div>

                  {isConsultant && (
                    <>
                      <div className="border-t border-outline-variant/30 my-4" />
                      <h3 className="text-sm font-semibold text-on-surface">Consultant Details</h3>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                          Category <span className="text-error">*</span>
                        </label>
                        <Input
                          {...registerConsultant('category')}
                          icon={<Briefcase size={18} />}
                          placeholder="e.g. healthcare"
                          error={consultantErrors.category?.message}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                          Specialization
                        </label>
                        <select
                          {...registerConsultant('specialization_id')}
                          className="w-full px-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="">Select Specialization</option>
                          {specializations?.map((spec: any) => (
                            <option key={spec.id} value={spec.id}>
                              {spec.name}
                            </option>
                          ))}
                        </select>
                        {consultantErrors.specialization_id && (
                          <p className="text-error text-xs mt-1">{consultantErrors.specialization_id.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                          Experience (years)
                        </label>
                        <Input
                          {...registerConsultant('experience_years', { valueAsNumber: true })}
                          icon={<Clock size={18} />}
                          type="number"
                          placeholder="0"
                          min={0}
                          max={60}
                          error={consultantErrors.experience_years?.message}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                          Per Minute Fee (₹)
                        </label>
                        <Input
                          {...registerConsultant('per_minute_fee', { valueAsNumber: true })}
                          icon={<DollarSign size={18} />}
                          type="number"
                          placeholder="50"
                          min={10}
                          max={10000}
                          error={consultantErrors.per_minute_fee?.message}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                          Bio
                        </label>
                        <textarea
                          {...registerConsultant('bio')}
                          rows={3}
                          placeholder="Tell clients about yourself..."
                          className="w-full px-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                        {consultantErrors.bio && (
                          <p className="text-error text-xs mt-1">{consultantErrors.bio.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="border-t border-outline-variant/30 my-4" />

                  <h3 className="text-sm font-semibold text-on-surface">Change Password</h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <Input
                        {...registerPassword('old_password')}
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        error={passwordErrors.old_password?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <Input
                        {...registerPassword('new_password')}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        error={passwordErrors.new_password?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <Input
                        {...registerPassword('confirm_password')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        error={passwordErrors.confirm_password?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Saving...' : 'Save All Changes'}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}