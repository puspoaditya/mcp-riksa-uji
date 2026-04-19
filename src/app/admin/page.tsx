import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: alat } = await supabase
    .from('alat')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: access } = await supabase
    .from('perusahaan_access')
    .select('*')
    .order('nama_perusahaan', { ascending: true })

  return (
    <AdminDashboardClient 
      initialData={alat || []} 
      profiles={profiles || []}
      accessCodes={access || []}
      userEmail={user.email || ''} 
    />
  )
}
