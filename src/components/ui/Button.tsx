'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-pixel transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-pixel-blue text-white border-2 border-pixel-navy shadow-pixel hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:ring-pixel-blue': variant === 'primary',
            'bg-pixel-card text-pixel-navy border-2 border-pixel-navy shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none focus-visible:ring-pixel-navy': variant === 'secondary',
            'border-2 border-pixel-navy bg-transparent text-pixel-navy shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none focus-visible:ring-pixel-navy': variant === 'outline',
            'text-pixel-navy hover:bg-pixel-card focus-visible:ring-pixel-navy': variant === 'ghost',
            'bg-red-600 text-white border-2 border-red-800 shadow-[2px_2px_0px_#991b1b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none focus-visible:ring-red-600': variant === 'danger',
          },
          {
            'h-8 px-3 text-[10px]': size === 'sm',
            'h-10 px-4 text-[10px]': size === 'md',
            'h-12 px-6 text-xs': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
