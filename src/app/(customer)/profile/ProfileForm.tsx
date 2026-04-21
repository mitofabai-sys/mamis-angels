'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Props {
  userId: string
  initialFullName: string
  initialPhone: string
}

export default function ProfileForm({ userId, initialFullName, initialPhone }: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName, phone: phone || null })
      .eq('id', userId)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">Profile saved!</div>
      )}

      <Input
        id="fullName"
        label="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        id="phone"
        label="Phone number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+63 912 345 6789"
      />

      <Button type="submit" loading={saving}>
        Save changes
      </Button>
    </form>
  )
}
