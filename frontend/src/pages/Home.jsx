import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Gallery from '../components/Gallery'

export default function Home() {
  return (
    <section>
      <Hero />

      <div id="services" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">Kako funkcioniše zakazivanje</h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-300">Tri brza koraka do savršenog šišanja.</p>
        </div>

        <div className="relative mt-6 sm:mt-10">
          {/* Desktop connecting line */}
          <div className="hidden sm:block absolute inset-x-8 top-10 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-5 sm:p-6 transition hover:border-yellow-500/60 hover:shadow-[0_0_0_1px_rgba(250,204,21,0.2)]">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-yellow-400 via-yellow-600 to-amber-700">
                    <div className="h-10 w-10 rounded-full bg-black/90 flex items-center justify-center text-yellow-400 font-bold">1</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8 10-5-5"/></svg>
                    <div className="font-semibold text-zinc-100">Izaberi uslugu</div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">Kratko, fade, klasično šišanje ili sređivanje brade — odaberi šta ti treba.</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-5 sm:p-6 transition hover:border-yellow-500/60 hover:shadow-[0_0_0_1px_rgba(250,204,21,0.2)]">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-yellow-400 via-yellow-600 to-amber-700">
                    <div className="h-10 w-10 rounded-full bg-black/90 flex items-center justify-center text-yellow-400 font-bold">2</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16h6"/></svg>
                    <div className="font-semibold text-zinc-100">Odaberi datum i termin</div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">Vidljivi su samo slobodni termini — izaberi ono što ti najviše odgovara.</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-5 sm:p-6 transition hover:border-yellow-500/60 hover:shadow-[0_0_0_1px_rgba(250,204,21,0.2)]">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-yellow-400 via-yellow-600 to-amber-700">
                    <div className="h-10 w-10 rounded-full bg-black/90 flex items-center justify-center text-yellow-400 font-bold">3</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <div className="font-semibold text-zinc-100">Potvrdi i završi</div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">Upiši ime i telefon — potvrda stiže odmah nakon rezervacije.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
  </div>

  <Gallery />
    </section>
  )
}
