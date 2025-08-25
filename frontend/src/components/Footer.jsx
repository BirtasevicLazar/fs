import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-black/80 backdrop-blur pt-10 pb-12 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="gold-text text-xl semibold">Young Star Cutz</div>
            <p className="mt-3 text-sm text-zinc-400">
              Muški frizerski salon u Kragujevcu. Precizno šišanje, moderni fade i brada po meri.
            </p>
          </div>

          {/* Contact */}
          <div>
            <div className="text-zinc-200 semibold">Kontakt</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="hover:text-yellow-400" href="tel:+381601234567">+381 60 123 4567</a>
              </li>
              <li className="text-zinc-400">Kragujevac, Srbija</li>
              <li className="text-zinc-400">Radno vreme: 09–20h</li>
            </ul>
          </div>

          {/* Links & Socials */}
          <div>
            <div className="text-zinc-200 semibold">Brzi linkovi</div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link className="hover:text-yellow-400" to="/">Početna</Link>
              <Link className="hover:text-yellow-400" to="/book">Rezerviši</Link>
              <Link className="hover:text-yellow-400" to="/admin">Admin</Link>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg border border-zinc-800 hover:border-yellow-500">
                <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg border border-zinc-800 hover:border-yellow-500">
                <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 9H15V6h-1.5C11.57 6 10 7.57 10 9.5V11H8v3h2v6h3v-6h2.1l.9-3H13v-1.5c0-.28.22-.5.5-.5z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 h-px bg-zinc-800" />
        <div className="mt-4 text-xs text-zinc-500">
          © {new Date().getFullYear()} Young Star Cutz. Sva prava zadržana.
        </div>
      </div>
    </footer>
  )
}
