import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Login() {
  const nav = useNavigate()
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
      nav('/admin')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-20 pb-16 pt-safe">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Admin prijava</h1>
      <form onSubmit={submit} className="space-y-4 bg-zinc-950/80 backdrop-blur border border-zinc-800 p-5 sm:p-6 rounded-2xl">
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Korisničko ime</label>
          <input className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Lozinka</label>
          <input type="password" className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="w-full tap px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-60">
          {loading ? 'Prijava…' : 'Prijavi se'}
        </button>
      </form>
    </div>
  )
}
