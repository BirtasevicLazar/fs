import s1 from '../assets/s1.png'
import s2 from '../assets/s2.png'
import s3 from '../assets/s3.png'
import s4 from '../assets/s4.png'
import { useEffect, useRef, useState } from 'react'
export default function Gallery() {
  // Freepik direct hotlinks often break; as a working demo we keep reliable placeholder hosts.
  // Replace these with your own Freepik-downloaded files in /public for production.
  const images = [
  { src: s2 },
  { src: s1 },
  { src: s3 },
  { src: s4 },
  // placeholders for next 4 – reuse until you replace
  { src: s1 },
  { src: s3 },
  { src: s2 },
  { src: s4 },
  ]

  const groups = [
    // single editorial group: big left, top wide + two small right
    { bigFirst: true, idx: [0, 1, 2, 3] },
    // second group: mirrored composition for rhythm
    { bigFirst: false, idx: [4, 5, 6, 7] },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-yellow-400">Galerija</h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-300">Skroluj kroz odabrane fotografije salona i frizura.</p>
        </div>
      </div>

  {/* Mobile/tablet: horizontal scroller with arrows and progress */}
  <MobileScroller images={images} groups={groups} />

      {/* Large screens: horizontal snap-scroller with arrows */}
      <DesktopScroller images={images} groups={groups} />
    </section>
  )
}

function DesktopScroller({ images, groups }) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const max = Math.max(1, el.scrollWidth - el.clientWidth)
    setProgress(el.scrollLeft / max)
  }
  useEffect(() => {
    onScroll()
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => onScroll()
    window.addEventListener('resize', onResize)
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  const scrollByGroup = (dir) => {
    const el = ref.current
    if (!el) return
    const first = el.querySelector('[data-group]')
    const w = first ? first.clientWidth : el.clientWidth
    const gap = 24 // matches gap-6
    el.scrollBy({ left: dir * (w + gap), behavior: 'smooth' })
  }

  return (
    <div className="mt-8 hidden lg:block">
      <div className="relative">
        <div ref={ref} className="relative overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <div className="flex gap-6 pr-10">
            {groups.map((g, gi) => (
              <div key={gi} data-group className="shrink-0 w-[900px] xl:w-[980px] h-[480px] xl:h-[520px] snap-start">
                {g.bigFirst ? (
                  <div className="grid grid-cols-3 grid-rows-6 gap-4 h-full">
                    <figure className="group col-span-1 row-span-6">
                      <div className="relative rounded-2xl overflow-hidden h-full">
                        <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </div>
                    </figure>
                    <div className="col-span-2 row-span-6 grid grid-rows-6 gap-4 h-full">
                      <figure className="group row-span-3">
                        <div className="relative rounded-2xl overflow-hidden h-full">
                          <img src={images[g.idx[1]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                        </div>
                      </figure>
                      <div className="row-span-3 grid grid-cols-2 gap-4 h-full">
                        <figure className="group">
                          <div className="relative rounded-2xl overflow-hidden h-full">
                            <img src={images[g.idx[2]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                          </div>
                        </figure>
                        <figure className="group">
                          <div className="relative rounded-2xl overflow-hidden h-full">
                            <img src={images[g.idx[3]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                          </div>
                        </figure>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 grid-rows-6 gap-4 h-full">
                    <div className="col-span-2 row-span-6 grid grid-rows-6 gap-4 h-full">
                      <figure className="group row-span-3">
                        <div className="relative rounded-2xl overflow-hidden h-full">
                          <img src={images[g.idx[1]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                        </div>
                      </figure>
                      <div className="row-span-3 grid grid-cols-2 gap-4 h-full">
                        <figure className="group">
                          <div className="relative rounded-2xl overflow-hidden h-full">
                            <img src={images[g.idx[2]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                          </div>
                        </figure>
                        <figure className="group">
                          <div className="relative rounded-2xl overflow-hidden h-full">
                            <img src={images[g.idx[3]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                          </div>
                        </figure>
                      </div>
                    </div>
                    <figure className="group col-span-1 row-span-6">
                      <div className="relative rounded-2xl overflow-hidden h-full">
                        <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </div>
                    </figure>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="px-4">
          <div className="mt-4 h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-500" style={{ width: `${Math.round(progress*100)}%` }} />
          </div>
        </div>
        {/* Arrows */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
          <button onClick={() => scrollByGroup(-1)} className="pointer-events-auto ml-2 xl:ml-4 h-10 w-10 grid place-items-center rounded-full bg-black/60 backdrop-blur border border-zinc-800 hover:border-zinc-700 text-zinc-200" aria-label="Levo">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => scrollByGroup(1)} className="pointer-events-auto mr-2 xl:mr-4 h-10 w-10 grid place-items-center rounded-full bg-black/60 backdrop-blur border border-zinc-800 hover:border-zinc-700 text-zinc-200" aria-label="Desno">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function MobileScroller({ images, groups }) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const max = Math.max(1, el.scrollWidth - el.clientWidth)
    setProgress(el.scrollLeft / max)
  }
  useEffect(() => {
    onScroll()
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => onScroll()
    window.addEventListener('resize', onResize)
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  const scrollByGroup = (dir) => {
    const el = ref.current
    if (!el) return
    const first = el.querySelector('[data-group]')
    const w = first ? first.clientWidth : el.clientWidth
    const gap = 16 // matches gap-4
    el.scrollBy({ left: dir * (w + gap), behavior: 'smooth' })
  }

  return (
    <div className="mt-6 sm:mt-8 -mx-4 sm:mx-0 lg:hidden">
      <div className="px-4 sm:px-0">
        <div className="relative">
          <div ref={ref} className="relative overflow-x-auto no-scrollbar snap-x snap-mandatory">
            <div className="flex gap-4 pr-6">
              {groups.map((g, gi) => (
                <div key={gi} data-group className="shrink-0 w-[140vw] sm:w-[640px] h-[90vw] sm:h-[420px] snap-start">
                  {g.bigFirst ? (
                    <div className="grid grid-cols-3 grid-rows-6 gap-2 h-full">
                      <figure className="group col-span-1 row-span-6">
                        <div className="relative rounded-2xl overflow-hidden h-full">
                          <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                        </div>
                      </figure>
                      <div className="col-span-2 row-span-6 grid grid-rows-6 gap-2 h-full">
                        <figure className="group row-span-3">
                          <div className="relative rounded-2xl overflow-hidden h-full">
                            <img src={images[g.idx[1]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                          </div>
                        </figure>
                        <div className="row-span-3 grid grid-cols-2 gap-2 h-full">
                          <figure className="group">
                            <div className="relative rounded-2xl overflow-hidden h-full">
                              <img src={images[g.idx[2]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                            </div>
                          </figure>
                          <figure className="group">
                            <div className="relative rounded-2xl overflow-hidden h-full">
                              <img src={images[g.idx[3]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                            </div>
                          </figure>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 grid-rows-6 gap-2 h-full">
                      <div className="col-span-2 row-span-6 grid grid-rows-6 gap-2 h-full">
                        <figure className="group row-span-3">
                          <div className="relative rounded-2xl overflow-hidden h-full">
                            <img src={images[g.idx[1]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                          </div>
                        </figure>
                        <div className="row-span-3 grid grid-cols-2 gap-2 h-full">
                          <figure className="group">
                            <div className="relative rounded-2xl overflow-hidden h-full">
                              <img src={images[g.idx[2]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                            </div>
                          </figure>
                          <figure className="group">
                            <div className="relative rounded-2xl overflow-hidden h-full">
                              <img src={images[g.idx[3]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                            </div>
                          </figure>
                        </div>
                      </div>
                      <figure className="group col-span-1 row-span-6">
                        <div className="relative rounded-2xl overflow-hidden h-full">
                          <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                        </div>
                      </figure>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-500" style={{ width: `${Math.round(progress*100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
