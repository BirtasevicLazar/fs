import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden soft-grain">
      {/* Background image as subtle layer */}
  <img src="/frizer_hero.png" alt="Muški frizerski salon" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      {/* Vignette + gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pb-24 pt-safe">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="text-center md:text-left">
            <h1 className="mt-4 text-3xl sm:text-5xl semibold tracking-tight gold-text-animate gold-heading drop-shadow">
              Young Star Cutz
            </h1>
            <p className="mt-4 sm:mt-6 text-zinc-200 text-base sm:text-lg max-w-xl md:max-w-none mx-auto md:mx-0 thin">
              Precizno muško šišanje, moderni fade stilovi i sređivanje brade. Brzo online zakazivanje — bez poziva i čekanja.
            </p>
            <div className="mt-8 flex flex-col items-center md:items-start gap-3 sm:gap-4">
              <Link to="/book" className="tap w-full sm:w-auto px-6 py-3 rounded-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/10">
                Rezerviši termin
              </Link>
            </div>
            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                Profesionalni barber
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20l9-16H3l9 16z"/></svg>
                Premium kozmetika
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Brzo zakazivanje
              </span>
            </div>
          </div>

          {/* Right: Premium image card with gradient border */}
      <div className="relative">
            <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-yellow-400 via-yellow-600 to-amber-700 shadow-xl shadow-yellow-900/10">
              <div className="rounded-3xl overflow-hidden bg-black">
        <img src="/frizer_hero.png" alt="Muško šišanje u salonu" className="w-full h-72 sm:h-80 md:h-[420px] object-cover" />
              </div>
            </div>
            {/* floating badge */}
            <div className="absolute -bottom-4 -right-3 sm:-right-6 rounded-xl px-3 py-2 border border-zinc-800 glass text-xs text-zinc-200">
              Radno vreme: 09–20h
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
