'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvailabilityManager from './AvailabilityManager'
import type { Cleaner, Availability } from '@/types/app'

interface CleanerWithSlots extends Cleaner {
  availability: Availability[]
}

interface Props {
  cleaners: CleanerWithSlots[]
}

export default function CleanerList({ cleaners: initialCleaners }: Props) {
  const [cleaners, setCleaners] = useState(initialCleaners)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Add cleaner form state
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function addCleaner(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('cleaners')
      .insert({ full_name: fullName, email: email || null, phone: phone || null, is_active: true })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setCleaners((prev) => [...prev, { ...data, availability: [] }])
      setFullName('')
      setEmail('')
      setPhone('')
      setShowForm(false)
    }
    setAdding(false)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('cleaners').update({ is_active: !current }).eq('id', id)
    setCleaners((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cleaners</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add cleaner'}
        </button>
      </div>

      {/* Add cleaner form */}
      {showForm && (
        <form onSubmit={addCleaner} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col gap-3">
          <h3 className="font-semibold text-gray-900">New cleaner</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-gray-500">Full name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Maria Santos"
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@example.com"
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-gray-500">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 912 345 6789"
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-50 transition-colors"
            >
              {adding ? 'Adding…' : 'Add cleaner'}
            </button>
          </div>
        </form>
      )}

      {/* Cleaner list */}
      <div className="flex flex-col gap-4">
        {cleaners.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            No cleaners yet. Add your first cleaner above.
          </div>
        )}
        {cleaners.map((cleaner) => (
          <div key={cleaner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{cleaner.full_name}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      cleaner.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {cleaner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[cleaner.email, cleaner.phone].filter(Boolean).join(' · ') || 'No contact info'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(cleaner.id, cleaner.is_active)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {cleaner.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setExpanded(expanded === cleaner.id ? null : cleaner.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {expanded === cleaner.id ? 'Hide slots ▴' : 'Manage slots ▾'}
                </button>
              </div>
            </div>

            {expanded === cleaner.id && (
              <div className="border-t border-gray-100 px-5 pb-5">
                <AvailabilityManager
                  cleanerId={cleaner.id}
                  slots={cleaner.availability}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
