import Link from 'next/link'
import { KATEGORI_LIST } from '@/lib/utils'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function PetugasHomePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nama = user.user_metadata?.nama || user.email

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-brand-dark px-6 py-0 flex items-center justify-between h-16 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-red rounded-full flex items-center justify-center text-white font-bold text-sm">MC</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">PT Multi Cipta Prima</p>
            <p className="text-white/50 text-xs text-uppercase">Petugas Lapangan</p>
          </div>
        </div>
        <form action="/auth/logout" method="post">
            <button type="submit" className="text-white/80 hover:text-white text-sm border border-white/20 hover:border-white/50 rounded-lg px-4 py-2 transition-all">
                Keluar
            </button>
        </form>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-[#2d1b47] py-12 px-6 text-center text-white">
        <span className="bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase inline-block mb-4">
          Dashboard Petugas
        </span>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
          Selamat Datang, {nama}
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
          Pilih kategori di bawah untuk membuat Berita Acara Riksa Uji baru.
        </p>
        <Link href="/petugas/data" className="inline-block bg-brand-red text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors shadow-lg">
          Lihat Data Berita Acara Saya
        </Link>
      </div>

      {/* Categories */}
      <main className="flex-1 py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Pilih Kategori untuk Dibuat</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {KATEGORI_LIST.map((k) => (
              <Link
                key={k.label}
                href={`/petugas/${encodeURIComponent(k.label)}`}
                className="group card p-5 flex items-center gap-4 hover:border-brand-red hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-xl flex items-center justify-center text-2xl transition-colors flex-shrink-0">
                  {k.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{k.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{k.sub}</p>
                </div>
                <span className="text-gray-300 group-hover:text-brand-red text-xl transition-colors">›</span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} PT Multi Cipta Prima | Internal Field Access
      </footer>
    </div>
  )
}
