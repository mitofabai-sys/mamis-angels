import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-gray-100 text-gray-700': variant === 'default',
          'bg-yellow-100 text-yellow-800': variant === 'pending',
          'bg-green-100 text-green-800': variant === 'confirmed',
          'bg-blue-100 text-blue-800': variant === 'completed',
          'bg-red-100 text-red-800': variant === 'cancelled',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
