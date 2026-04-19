export const preferredRegion = 'sin1'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    // Check if the current user is an ADMIN (optional but recommended for security)
    // For now, we rely on the fact that this is an admin-only path or protected by middleware

    const { email, password, nama, role } = await request.json()

    if (!email || !password || !nama) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nama,
        role: role || 'PETUGAS'
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
