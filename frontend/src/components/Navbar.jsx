import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full transition-colors ${
    isActive ? 'bg-yellow-500 text-black' : 'text-zinc-200 hover:text-yellow-400'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800 glass pt-safe">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
  <Link to="/" className="semibold tracking-wide gold-text text-lg" onClick={()=>setOpen(false)}>
          Young Star Cutz
        </Link>
        <button className="sm:hidden tap p-2 rounded-lg border border-transparent hover:border-zinc-700" aria-label="Menu" onClick={()=>setOpen(o=>!o)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-zinc-200"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink to="/" className={navLinkClass} end>Početna</NavLink>
          <NavLink to="/book" className={navLinkClass}>Rezerviši</NavLink>
        </nav>
      </div>
      {open && (
        <div className="sm:hidden border-t border-zinc-800 px-4 pb-safe pb-4">
          <div className="flex flex-col py-2">
            <NavLink to="/" onClick={()=>setOpen(false)} className={navLinkClass} end>Početna</NavLink>
            <NavLink to="/book" onClick={()=>setOpen(false)} className={navLinkClass}>Rezerviši</NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
