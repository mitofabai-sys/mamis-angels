import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <>
      <Navbar user={profile} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </>
  )
}
