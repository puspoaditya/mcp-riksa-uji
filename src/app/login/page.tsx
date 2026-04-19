'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authErr) { setError('Email atau password salah. Coba lagi.'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role || 'PETUGAS'
    
    if (role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/petugas')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-[#2d1b47] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-brand-red rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">MC</div>
          <h1 className="font-bold text-lg text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">PT Multi Cipta Prima — Sistem Riksa Uji</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="admin@multiciptaprima.co.id"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk ke Sistem'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Kembali ke Halaman Customer
          </Link>
        </div>
      </div>
    </div>
  )
}
