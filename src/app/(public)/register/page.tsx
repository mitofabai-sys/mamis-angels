'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/book')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👼</div>
          <h1 className="text-lg font-pixel text-pixel-navy leading-relaxed">Create account</h1>
          <p className="text-pixel-muted text-sm mt-2 font-sans">Join Mommy&apos;s Angels and book your first clean</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-pixel-card border-2 border-pixel-navy shadow-pixel p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-400 px-3 py-2 text-sm text-red-700 font-sans">
              {error}
            </div>
          )}

          <Input
            id="fullName"
            type="text"
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maria Santos"
            required
            autoComplete="name"
          />

          <Input
            id="phone"
            type="tel"
            label="Phone number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+63 912 345 6789"
            autoComplete="tel"
          />

          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-pixel-muted mt-4 font-sans">
          Already have an account?{' '}
          <Link href="/login" className="text-pixel-blue font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
