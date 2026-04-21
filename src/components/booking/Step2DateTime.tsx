'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { formatTime } from '@/lib/utils/formatDate'
import Button from '@/components/ui/Button'
import type { Availability, BookingFormState } from '@/types/app'

interface Props {
  formData: BookingFormState
  updateField: <K extends keyof BookingFormState>(field: K, value: BookingFormState[K]) => void
  onNext: () => void
  onBack: () => void
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function Step2DateTime({ formData, updateField, onNext, onBack }: Props) {
  const [availableSlots, setAvailableSlots] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('availability')
      .select('*')
      .eq('is_booked', false)
      .gte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .then(({ data }) => {
        setAvailableSlots(data ?? [])
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const availableDates = new Set(availableSlots.map((s) => s.date))

  const slotsForDate = availableSlots.filter((s) => s.date === formData.bookingDate)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const todayStr = today.toISOString().split('T')[0]

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

  function selectDate(dateStr: string) {
    updateField('bookingDate', dateStr)
    updateField('bookingTime', '')
    updateField('availabilityId', '')
  }

  function selectSlot(slot: Availability) {
    updateField('bookingTime', slot.start_time.slice(0, 5))
    updateField('availabilityId', slot.id)
  }

  const canProceed = !!formData.bookingDate && !!formData.bookingTime

  if (loading) return <div className="text-center py-12 text-gray-400">Loading availability…</div>

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
          <p className="text-sm font-semibold text-gray-900">{MONTH_NAMES[viewMonth]} {viewYear}</p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = toISODate(viewYear, viewMonth, day)
            const isAvailable = availableDates.has(dateStr)
            const isSelected = formData.bookingDate === dateStr
            const isPast = dateStr < todayStr

            return (
              <button
                key={day}
                onClick={() => isAvailable && !isPast && selectDate(dateStr)}
                disabled={!isAvailable || isPast}
                className={cn(
                  'rounded-lg py-2 text-sm font-medium transition-colors',
                  isSelected && 'bg-pink-600 text-white',
                  !isSelected && isAvailable && !isPast && 'bg-pink-50 text-pink-700 hover:bg-pink-100',
                  (!isAvailable || isPast) && 'text-gray-300 cursor-not-allowed'
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Highlighted dates have available cleaners</p>
      </div>

      {/* Time slots */}
      {formData.bookingDate && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Available time slots — {new Date(formData.bookingDate + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {slotsForDate.length === 0 ? (
            <p className="text-sm text-gray-400">No slots available for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slotsForDate.map((slot) => {
                const timeStr = slot.start_time.slice(0, 5)
                const isSelected = formData.availabilityId === slot.id
                return (
                  <button
                    key={slot.id}
                    onClick={() => selectSlot(slot)}
                    className={cn(
                      'px-4 py-2 rounded-xl border text-sm font-semibold transition-colors',
                      isSelected
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                    )}
                  >
                    {formatTime(timeStr)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next: Address
        </Button>
      </div>
    </div>
  )
}
