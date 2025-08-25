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
    <div className="min-h-screen pt-20 pb-16 pt-safe flex items-start sm:items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <div className="gold-text text-2xl semibold">Young Star Cutz</div>
          <div className="text-zinc-400 text-sm mt-1">Admin prijava</div>
        </div>
        <form onSubmit={submit} className="space-y-4 glass border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-2xl">
          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 rounded-lg p-2">{error}</div>
          )}
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Korisničko ime</label>
            <input
              className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500"
              value={username}
              onChange={e=>setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Lozinka</label>
            <input
              type="password"
              className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button disabled={loading} className="w-full tap px-4 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-60">
            {loading ? 'Prijava…' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  )
}
