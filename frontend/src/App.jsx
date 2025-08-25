import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AdminNavbar from './admin/AdminNavbar.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './admin/Admin.jsx'
import Login from './admin/Login.jsx'
import { useEffect, useState } from 'react'
import { api } from './lib/api'

function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let alive = true
    setLoading(true)
    api.me()
      .then(() => { if (alive) { setAuthed(true); setLoading(false) } })
      .catch(() => { if (alive) { setAuthed(false); setLoading(false) } })
    return () => { alive = false }
  }, [location.pathname])

  if (loading) return <div className="pt-24 text-center text-zinc-400">Provera pristupa…</div>
  if (!authed) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

function App() {
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      {isAdminArea ? <AdminNavbar /> : <Navbar />}
      <main className="flex-1 pt-20 sm:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminArea && <Footer />}
    </div>
  )
}

export default App
