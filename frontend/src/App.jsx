import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'

function App() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <main className="pt-20 pb-28 sm:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
