'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import type { BookingFormState } from '@/types/app'

interface Props {
  formData: BookingFormState
  updateField: <K extends keyof BookingFormState>(field: K, value: BookingFormState[K]) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3AddressNotes({ formData, updateField, onNext, onBack }: Props) {
  const [touched, setTouched] = useState(false)

  const canProceed = formData.address.trim().length > 0

  function handleNext() {
    setTouched(true)
    if (canProceed) onNext()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Where should we clean?</h3>
        <p className="text-sm text-gray-500">Provide your complete address so our cleaner can find you.</p>
      </div>

      <Input
        id="address"
        label="Full address"
        value={formData.address}
        onChange={(e) => updateField('address', e.target.value)}
        placeholder="Unit 12B, The Residences, Ayala Ave, Makati City, 1200"
        required
        error={touched && !canProceed ? 'Address is required' : undefined}
      />

      <Textarea
        id="notes"
        label="Special instructions (optional)"
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        placeholder="e.g. Call upon arrival, leave key under mat, focus on kitchen…"
        rows={4}
      />

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Review booking</Button>
      </div>
    </div>
  )
}
