import { cn } from '@/lib/utils/cn'

const STEPS = ['Service', 'Date & Time', 'Address', 'Confirm']

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isCompleted && 'bg-pink-600 text-white',
                  isActive && 'bg-pink-600 text-white ring-4 ring-pink-100',
                  !isCompleted && !isActive && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? '✓' : step}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium',
                  isActive ? 'text-pink-600' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-12 sm:w-16 mb-4 mx-1 transition-colors',
                  step < currentStep ? 'bg-pink-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
