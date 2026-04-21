'use client'

import { useState, useCallback } from 'react'
import type { BookingFormState } from '@/types/app'

const initialState: BookingFormState = {
  propertyType: null,
  bedroomCount: null,
  serviceTypeId: '',
  addonSelections: [],
  bookingDate: '',
  bookingTime: '',
  availabilityId: '',
  address: '',
  notes: '',
  totalPrice: 0,
}

export function useBookingForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')

  const updateField = useCallback(
    <K extends keyof BookingFormState>(field: K, value: BookingFormState[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const setAddonQuantity = useCallback((addonId: string, quantity: number) => {
    setFormData((prev) => {
      const existing = prev.addonSelections.findIndex((a) => a.addonId === addonId)
      if (quantity <= 0) {
        return {
          ...prev,
          addonSelections: prev.addonSelections.filter((a) => a.addonId !== addonId),
        }
      }
      if (existing >= 0) {
        const updated = [...prev.addonSelections]
        updated[existing] = { addonId, quantity }
        return { ...prev, addonSelections: updated }
      }
      return { ...prev, addonSelections: [...prev.addonSelections, { addonId, quantity }] }
    })
  }, [])

  const toggleAddon = useCallback((addonId: string, selected: boolean) => {
    setFormData((prev) => {
      if (!selected) {
        return { ...prev, addonSelections: prev.addonSelections.filter((a) => a.addonId !== addonId) }
      }
      if (prev.addonSelections.some((a) => a.addonId === addonId)) return prev
      return { ...prev, addonSelections: [...prev.addonSelections, { addonId, quantity: 1 }] }
    })
  }, [])

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 4)), [])
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')
      setSubmittedBookingId(data.bookingId)
      setStep(5) // success step
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  return {
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
  }
}
