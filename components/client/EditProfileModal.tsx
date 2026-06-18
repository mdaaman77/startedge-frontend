'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
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
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
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

  const onProfileUpdate = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true)
    try {
      toast.success('Profile updated successfully')
      await refetch()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onPasswordChange = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      toast.success('Password changed successfully')
      resetPassword()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

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
                {/* Profile Form */}
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
                      Phone
                    </label>
                    <Input
                      {...registerProfile('phone')}
                      icon={<Phone size={18} />}
                      placeholder="9876543210"
                      error={profileErrors.phone?.message}
                    />
                  </div>

                  <Button type="submit" variant="gradient" disabled={isUpdatingProfile} className="w-full">
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>

                <div className="border-t border-outline-variant/30 my-4" />

                {/* Change Password Section */}
                <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
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

                  <Button type="submit" variant="outline" disabled={isChangingPassword} className="w-full">
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
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