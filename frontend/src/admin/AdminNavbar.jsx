import { useNavigate, Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function AdminNavbar() {
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const isLogin = location.pathname.startsWith('/login')

  // Close confirm with Escape
  useEffect(() => {
    if (!showConfirm) return
    const onKey = (e) => { if (e.key === 'Escape') setShowConfirm(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showConfirm])

  const doLogout = async () => {
    try {
      setLoading(true)
      await api.logout()
    } catch (_) { /* noop */ }
    finally {
      setLoading(false)
      setShowConfirm(false)
      nav('/login', { replace: true })
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800 glass pt-safe">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="semibold tracking-wide gold-text text-lg">Young Star Cutz</Link>
        </div>
        <div className="flex items-center gap-2">
          {!isLogin && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            aria-label="Odjava"
            title="Odjava"
            className="tap h-10 w-10 grid place-items-center rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {/* Bracket */}
                <path d="M4 4h6v4" />
                <path d="M10 16v4H4" />
                {/* Arrow pointing right (logout) */}
                <path d="M14 7l5 5-5 5" />
                <path d="M19 12H9" />
              </svg>
            )}
          </button>
          )}
          {!isLogin && showConfirm && createPortal(
            <div className="fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-black/70" onClick={() => { if (!loading) setShowConfirm(false) }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                <div className="rounded-2xl border border-zinc-800 glass p-5 sm:p-6 shadow-2xl">
                  <div className="text-lg font-semibold text-zinc-100">Odjaviti se?</div>
                  <div className="mt-2 text-sm text-zinc-400">Bićete odjavljeni i preusmereni na stranicu za prijavu.</div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button disabled={loading} onClick={() => setShowConfirm(false)} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 disabled:opacity-50">Odustani</button>
                    <button disabled={loading} onClick={doLogout} className="tap px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading && <span className="h-4 w-4 rounded-full border-2 border-black/60 border-t-transparent animate-spin" />}
                      <span>Da, odjavi me</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  )
}
