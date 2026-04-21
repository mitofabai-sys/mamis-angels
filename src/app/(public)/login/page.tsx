'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/book')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👼</div>
          <h1 className="text-lg font-pixel text-pixel-navy leading-relaxed">Welcome back</h1>
          <p className="text-pixel-muted text-sm mt-2 font-sans">Log in to your Mommy&apos;s Angels account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-pixel-card border-2 border-pixel-navy shadow-pixel p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-400 px-3 py-2 text-sm text-red-700 font-sans">
              {error}
            </div>
          )}

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
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-pixel-muted mt-4 font-sans">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-pixel-blue font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
