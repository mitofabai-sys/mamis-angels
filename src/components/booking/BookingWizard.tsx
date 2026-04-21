'use client'

import Link from 'next/link'
import { useBookingForm } from '@/hooks/useBookingForm'
import StepIndicator from './StepIndicator'
import Step1ServiceSelect from './Step1ServiceSelect'
import Step2DateTime from './Step2DateTime'
import Step3AddressNotes from './Step3AddressNotes'
import Step4Confirmation from './Step4Confirmation'

export default function BookingWizard() {
  const {
    step,
    formData,
    updateField,
    setAddonQuantity,
    toggleAddon,
    goNext,
    goBack,
    submit,
    isSubmitting,
    submittedBookingId,
    submitError,
  } = useBookingForm()

  // Success screen
  if (step === 5) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking confirmed!</h2>
        <p className="text-gray-500 mb-1">
          You&apos;ll receive an SMS and email confirmation shortly.
        </p>
        <p className="text-xs text-gray-400 mb-8">Booking ID: {submittedBookingId}</p>
        <Link
          href="/bookings"
          className="inline-block px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors"
        >
          View my bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Book a cleaning</h1>
        <p className="text-sm text-gray-500 mt-0.5">Professional, trusted cleaners at your door.</p>
      </div>

      <StepIndicator currentStep={step} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {step === 1 && (
          <Step1ServiceSelect
            formData={formData}
            updateField={updateField}
            setAddonQuantity={setAddonQuantity}
            toggleAddon={toggleAddon}
            onNext={goNext}
          />
        )}
        {step === 2 && (
          <Step2DateTime
            formData={formData}
            updateField={updateField}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <Step3AddressNotes
            formData={formData}
            updateField={updateField}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <Step4Confirmation
            formData={formData}
            onBack={goBack}
            onSubmit={submit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  )
}
