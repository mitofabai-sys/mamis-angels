import { createClient } from '@/lib/supabase/server'
import CleanerList from '@/components/admin/CleanerList'

export default async function AdminCleanersPage() {
  const supabase = await createClient()

  const { data: cleaners } = await supabase
    .from('cleaners')
    .select('*, availability(*)')
    .order('full_name')

  return (
    <CleanerList
      cleaners={(cleaners ?? []).map((c) => ({
        ...c,
        availability: (c.availability ?? []).sort((a: { date: string }, b: { date: string }) =>
          a.date.localeCompare(b.date)
        ),
      }))}
    />
  )
}
