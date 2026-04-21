'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/types/app'

interface Props {
  cleanerId: string
  slots: Availability[]
}

export default function AvailabilityManager({ cleanerId, slots: initialSlots }: Props) {
  const [slots, setSlots] = useState<Availability[]>(initialSlots)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function addSlot() {
    if (!date || !startTime || !endTime) return
    setAdding(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('availability')
      .insert({ cleaner_id: cleanerId, date, start_time: startTime, end_time: endTime, is_booked: false })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setSlots((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setDate('')
    }
    setAdding(false)
  }

  async function removeSlot(id: string) {
    const supabase = createClient()
    await supabase.from('availability').delete().eq('id', id)
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="mt-4 bg-gray-50 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Availability slots</h4>

      {/* Add slot */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
        />
        <span className="self-center text-gray-400 text-sm">to</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
        />
        <button
          onClick={addSlot}
          disabled={!date || adding}
          className="px-4 py-1.5 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-50 transition-colors"
        >
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      {/* Slot list */}
      {slots.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No availability slots yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                slot.is_booked ? 'bg-red-50 text-red-700' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <span>
                {slot.date} · {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                {slot.is_booked && <span className="ml-2 text-xs font-semibold">(booked)</span>}
              </span>
              {!slot.is_booked && (
                <button
                  onClick={() => removeSlot(slot.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-3"
                  title="Remove slot"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
