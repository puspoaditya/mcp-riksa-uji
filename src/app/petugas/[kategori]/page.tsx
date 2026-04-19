import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { KATEGORI_LIST } from '@/lib/utils'
import PetugasCategoryForm from './PetugasCategoryForm'

export default async function PetugasCategoryPage({ params }: { params: { kategori: string } }) {
  const kategori = decodeURIComponent(params.kategori)
  const kategoriData = KATEGORI_LIST.find(k => k.label === kategori)
  
  if (!kategoriData) return notFound()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <PetugasCategoryForm
      userId={user.id}
      kategori={kategori}
    />
  )
}
