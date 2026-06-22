'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full">
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">{icon}</div>}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full px-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors',
              icon && 'pl-10',
              isPassword && 'pr-10',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-error text-xs mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'