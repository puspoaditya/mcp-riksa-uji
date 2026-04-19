import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Jika env var tidak ada, biarkan request berlanjut (atau tangani sesuai kebutuhan)
  // Ini mencegah crash total (500) jika konfigurasi belum siap
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Penting: panggil getUser() untuk me-refresh session jika diperlukan
  const { data: { user } } = await supabase.auth.getUser()

  // ── Proteksi Route ──
  const { pathname } = request.nextUrl
  const role = user?.user_metadata?.role || 'PETUGAS'

  // Proteksi /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/petugas', request.url))
    }
  }

  // Proteksi /petugas routes
  if (pathname.startsWith('/petugas')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect user yang sudah login dari halaman /login ke dashboard yang sesuai
  if (pathname === '/login' && user) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/petugas', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/petugas/:path*', '/login'],
}
