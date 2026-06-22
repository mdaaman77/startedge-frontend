'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/lib/api/user'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// --- Profile Schema ---
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
})

// --- Password Schema ---
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
type PasswordFormData = z.infer<typeof passwordSchema>

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, refetch } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()

  // --- Profile Form ---
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
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

  // --- Password Form ---
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
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

  // Watch password fields to check if they're filled
  const passwordValues = watchPassword()
  const hasPasswordChanges = passwordValues.old_password || passwordValues.new_password || passwordValues.confirm_password

  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
      })
    }
  }, [user, resetProfile])

  // Helper function to extract error message
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

  // --- Combined Submit Handler ---
  const onSubmit = async (data: {
    profile: ProfileFormData
    password: PasswordFormData
  }) => {
    const { profile, password } = data
    
    setIsSubmitting(true)
    
    try {
      // Step 1: Check if profile has changes
      const profileData: Record<string, string | null> = {}
      
      if (profile.first_name && profile.first_name !== user?.first_name) {
        profileData.first_name = profile.first_name
      }
      if (profile.last_name && profile.last_name !== user?.last_name) {
        profileData.last_name = profile.last_name
      }
      if (profile.phone !== undefined && profile.phone !== user?.phone) {
        profileData.phone = profile.phone?.trim() === '' ? null : profile.phone
      }
      
      const hasProfileChanges = Object.keys(profileData).length > 0
      
      // Step 2: Check if password has changes
      const hasPasswordChanges = password.old_password && password.new_password && password.confirm_password
      
      // If no changes, show message and close
      if (!hasProfileChanges && !hasPasswordChanges) {
        toast('No changes to save', { icon: 'ℹ️' })
        onClose()
        return
      }
      
      // Step 3: Update profile if changed
      if (hasProfileChanges) {
        await updateProfile(profileData).unwrap()
        console.log('✅ Profile updated')
      }
      
      // Step 4: Update password if changed
      if (hasPasswordChanges) {
        await changePassword({
          old_password: password.old_password,
          new_password: password.new_password,
          confirm_password: password.confirm_password,
        }).unwrap()
        console.log('✅ Password updated')
      }
      
      // Step 5: Success
      toast.success('Profile updated successfully')
      await refetch()
      resetPassword()
      onClose()
      
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Individual Submit Handlers (for backward compatibility) ---
  const onProfileUpdate = async (data: ProfileFormData) => {
    // This is now handled by the combined submit
    onSubmit({ profile: data, password: watchPassword() })
  }

  const onPasswordChange = async (data: PasswordFormData) => {
    // This is now handled by the combined submit
    onSubmit({ profile: watchProfile(), password: data })
  }

  const isLoading = isUpdatingProfile || isChangingPassword || isSubmitting

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
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <h2 className="text-xl font-bold text-on-surface">Edit Profile</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Form - Now submits everything together */}
                <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
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

                  <div className="border-t border-outline-variant/30 my-4" />

                  {/* Change Password Section - Integrated */}
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

                  <Button type="submit" variant="gradient" disabled={isLoading} className="w-full">
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