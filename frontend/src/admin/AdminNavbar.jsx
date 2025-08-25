import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useState } from 'react'

export default function AdminNavbar() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)

  const logout = async () => {
    try {
      setLoading(true)
      await api.logout()
    } catch (_) { /* noop */ }
    finally { setLoading(false); nav('/login', { replace: true }) }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800 glass pt-safe">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="semibold tracking-wide gold-text text-lg">Young Star Cutz</Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={logout} disabled={loading} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 disabled:opacity-50">
            {loading ? 'Odjavljivanje…' : 'Odjava'}
          </button>
        </div>
      </div>
    </header>
  )
}
