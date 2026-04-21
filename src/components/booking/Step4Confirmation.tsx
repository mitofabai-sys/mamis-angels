'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import Button from '@/components/ui/Button'
import type { ServiceType, Addon, BookingFormState } from '@/types/app'

interface Props {
  formData: BookingFormState
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  submitError: string
}

export default function Step4Confirmation({ formData, onBack, onSubmit, isSubmitting, submitError }: Props) {
  const [serviceType, setServiceType] = useState<ServiceType | null>(null)
  const [addons, setAddons] = useState<Addon[]>([])

  useEffect(() => {
    if (!formData.serviceTypeId) return
    const supabase = createClient()
    Promise.all([
      supabase.from('service_types').select('*').eq('id', formData.serviceTypeId).single(),
      formData.addonSelections.length > 0
        ? supabase
            .from('addons')
            .select('*')
            .in('id', formData.addonSelections.map((a) => a.addonId))
        : Promise.resolve({ data: [] }),
    ]).then(([{ data: st }, { data: ad }]) => {
      if (st) setServiceType(st)
      if (ad) setAddons(ad)
    })
  }, [formData.serviceTypeId, formData.addonSelections])

  const bedroomLabel: Record<string, string> = {
    studio: 'Studio', '1br': '1 Bedroom', '2br': '2 Bedrooms',
    '3br': '3 Bedrooms', '4br': '4 Bedrooms',
  }

  const rows = [
    { label: 'Service', value: serviceType ? `${serviceType.property_type === 'condo' ? 'Condo' : 'House'} — ${bedroomLabel[serviceType.bedroom_count] ?? ''}` : '—' },
    { label: 'Date', value: formData.bookingDate ? formatDate(formData.bookingDate) : '—' },
    { label: 'Time', value: formData.bookingTime ? formatTime(formData.bookingTime) : '—' },
    { label: 'Address', value: formData.address || '—' },
  ]

  if (formData.notes) {
    rows.push({ label: 'Notes', value: formData.notes })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Review your booking</h3>
        <p className="text-sm text-gray-500">Please confirm everything looks correct before submitting.</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-3">
            <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}

        {formData.addonSelections.length > 0 && (
          <div className="flex gap-3">
            <span className="text-sm text-gray-500 w-20 shrink-0">Add-ons</span>
            <ul className="flex flex-col gap-0.5">
              {formData.addonSelections.map((sel) => {
                const addon = addons.find((a) => a.id === sel.addonId)
                if (!addon) return null
                return (
                  <li key={sel.addonId} className="text-sm font-medium text-gray-900">
                    {addon.name}
                    {addon.has_quantity && sel.quantity > 1 ? ` ×${sel.quantity}` : ''}
                    {' — '}
                    <span className="text-gray-500">{formatCurrency(addon.price * sel.quantity)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(formData.totalPrice)}</span>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Button onClick={onSubmit} loading={isSubmitting} size="lg">
          Confirm booking
        </Button>
      </div>
    </div>
  )
}
