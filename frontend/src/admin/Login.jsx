import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Login() {
  const nav = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.login({ username, password })
      const to = location.state?.from?.pathname || '/admin'
      nav(to, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-safe pb-safe relative overflow-hidden flex items-center justify-center px-4">
      {/* subtle background accents */}
      <div className="pointer-events-none absolute inset-0 soft-grain" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 bg-yellow-500" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-10 bg-amber-300" aria-hidden="true" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <span className="gold-text text-2xl semibold gold-heading">Young Star Cutz</span>
            <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10 2l1.76 3.57 3.94.57-2.85 2.78.67 3.92L10 11.77l-3.52 1.87.67-3.92-2.85-2.78 3.94-.57L10 2z" />
            </svg>
          </div>
          <div className="text-zinc-400 text-sm mt-1">Admin prijava</div>
        </div>

        <form onSubmit={submit} className="space-y-4 glass border border-zinc-800/80 p-5 sm:p-6 rounded-2xl shadow-2xl ring-1 ring-yellow-500/10">
          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-800/60 rounded-lg p-2.5 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M9.401 1.93c.346-.6 1.252-.6 1.598 0l7.168 12.42c.334.578-.084 1.3-.8 1.3H3.033c-.716 0-1.134-.722-.8-1.3L9.401 1.93zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5A.75.75 0 0110 12z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Korisničko ime</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" /><path fillRule="evenodd" d="M.458 16.042A8 8 0 0110 12a8 8 0 019.542 4.042.75.75 0 01-.676 1.108H1.134a.75.75 0 01-.676-1.108z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                className="w-full tap rounded-lg bg-black/80 border border-zinc-800 pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/40"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="unesi korisničko ime"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Lozinka</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M5 8V6a5 5 0 1110 0v2h1.25A1.75 1.75 0 0118 9.75v6.5A1.75 1.75 0 0116.25 18H3.75A1.75 1.75 0 012 16.25v-6.5A1.75 1.75 0 013.75 8H5zm2-2a3 3 0 116 0v2H7V6z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full tap rounded-lg bg-black/80 border border-zinc-800 pl-9 pr-10 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/40"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="unesi lozinku"
              />
              <button
                type="button"
                onClick={()=>setShowPassword(v=>!v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.53-1.17 1.29-2.27 2.24-3.24" />
                    <path d="M22.94 11.94A10.94 10.94 0 0012 4C9.91 4 7.94 4.56 6.18 5.5" />
                    <path d="M14.12 9.88A3 3 0 1110.12 5.88" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full tap px-4 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" className="opacity-90" />
              </svg>
            )}
            <span>{loading ? 'Prijava…' : 'Prijavi se'}</span>
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Za pomoć kontakt: <span className="text-zinc-300">owner@youngstarcutz</span>
        </p>
      </div>
    </div>
  )
}
