'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import Button from '@/components/ui/Button'
import type { ServiceType, Addon, PropertyType, BedroomCount, BookingFormState } from '@/types/app'

const BEDROOM_OPTIONS: { value: BedroomCount; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1BR' },
  { value: '2br', label: '2BR' },
  { value: '3br', label: '3BR' },
  { value: '4br', label: '4BR' },
]

interface Props {
  formData: BookingFormState
  updateField: <K extends keyof BookingFormState>(field: K, value: BookingFormState[K]) => void
  setAddonQuantity: (addonId: string, quantity: number) => void
  toggleAddon: (addonId: string, selected: boolean) => void
  onNext: () => void
}

export default function Step1ServiceSelect({ formData, updateField, setAddonQuantity, toggleAddon, onNext }: Props) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('service_types').select('*'),
      supabase.from('addons').select('*').eq('is_active', true).order('name'),
    ]).then(([{ data: st }, { data: ad }]) => {
      if (st) setServiceTypes(st)
      if (ad) setAddons(ad)
      setLoading(false)
    })
  }, [])

  // Derive current service type when property + bedroom selected
  useEffect(() => {
    if (!formData.propertyType || !formData.bedroomCount) return
    const found = serviceTypes.find(
      (st) => st.property_type === formData.propertyType && st.bedroom_count === formData.bedroomCount
    )
    if (found) updateField('serviceTypeId', found.id)
  }, [formData.propertyType, formData.bedroomCount, serviceTypes, updateField])

  // Recompute total whenever selections change
  useEffect(() => {
    if (!formData.serviceTypeId) return
    const serviceType = serviceTypes.find((st) => st.id === formData.serviceTypeId)
    if (!serviceType) return

    const addonTotal = formData.addonSelections.reduce((sum, sel) => {
      const addon = addons.find((a) => a.id === sel.addonId)
      return sum + (addon ? addon.price * sel.quantity : 0)
    }, 0)

    updateField('totalPrice', serviceType.base_price + addonTotal)
  }, [formData.serviceTypeId, formData.addonSelections, serviceTypes, addons, updateField])

  const canProceed = !!formData.serviceTypeId

  const selectedService = serviceTypes.find((st) => st.id === formData.serviceTypeId)

  function getQuantity(addonId: string) {
    return formData.addonSelections.find((a) => a.addonId === addonId)?.quantity ?? 0
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading services…</div>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Property type toggle */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Property type</p>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 w-fit">
          {(['condo', 'house'] as PropertyType[]).map((type) => (
            <button
              key={type}
              onClick={() => updateField('propertyType', type)}
              className={cn(
                'px-6 py-2.5 text-sm font-semibold transition-colors',
                formData.propertyType === type
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {type === 'condo' ? '🏢 Condo' : '🏡 House'}
            </button>
          ))}
        </div>
        {formData.propertyType === 'condo' && (
          <p className="text-xs text-gray-400 mt-1">20–60 sqm</p>
        )}
        {formData.propertyType === 'house' && (
          <p className="text-xs text-gray-400 mt-1">61+ sqm</p>
        )}
      </div>

      {/* Bedroom count pills */}
      {formData.propertyType && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map(({ value, label }) => {
              const st = serviceTypes.find(
                (s) => s.property_type === formData.propertyType && s.bedroom_count === value
              )
              return (
                <button
                  key={value}
                  onClick={() => updateField('bedroomCount', value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                    formData.bedroomCount === value
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                  )}
                >
                  {label}
                  {st && <span className="ml-1.5 text-xs opacity-70">{formatCurrency(st.base_price)}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {selectedService && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Add-ons (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {addons.map((addon) => {
              const qty = getQuantity(addon.id)
              const isSelected = qty > 0

              return (
                <div
                  key={addon.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-3 transition-colors',
                    isSelected ? 'border-pink-300 bg-pink-50' : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{addon.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(addon.price)}/{addon.unit}
                    </p>
                  </div>

                  {addon.has_quantity ? (
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => setAddonQuantity(addon.id, qty - 1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm font-semibold text-gray-900">{qty}</span>
                      <button
                        onClick={() => setAddonQuantity(addon.id, qty + 1)}
                        className="w-7 h-7 rounded-full bg-pink-600 text-white hover:bg-pink-700 flex items-center justify-center text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleAddon(addon.id, e.target.checked)}
                      className="ml-3 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 shrink-0"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Running total */}
      {selectedService && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(formData.totalPrice)}</p>
          </div>
          <Button onClick={onNext} disabled={!canProceed} size="lg">
            Next: Date &amp; Time
          </Button>
        </div>
      )}

      {!selectedService && (
        <p className="text-sm text-gray-400 text-center py-4">
          Select a property type and size to see pricing.
        </p>
      )}
    </div>
  )
}
