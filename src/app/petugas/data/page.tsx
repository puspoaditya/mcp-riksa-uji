import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PetugasDataDashboard from './PetugasDataDashboard'

export default async function PetugasDataPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: alat } = await supabase
    .from('alat')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <PetugasDataDashboard 
      initialData={alat || []} 
      userEmail={user.email || ''} 
      userId={user.id}
    />
  )
}
