import s1 from '../assets/s1.png'
import s2 from '../assets/s2.png'
import s3 from '../assets/s3.png'
import s4 from '../assets/s4.png'
export default function Gallery() {
  // Freepik direct hotlinks often break; as a working demo we keep reliable placeholder hosts.
  // Replace these with your own Freepik-downloaded files in /public for production.
  const images = [
  { src: s2 },
  { src: s1 },
  { src: s3 },
  { src: s4 },
  ]

  const groups = [
    // single editorial group: big left, top wide + two small right
    { bigFirst: true, idx: [0, 1, 2, 3] },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-yellow-400">Galerija</h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-300">Skroluj kroz odabrane fotografije salona i frizura.</p>
        </div>
      </div>

      {/* Mobile/tablet: horizontal, snap-scrolling editorial groups (bigger on small screens with overflow) */}
      <div className="mt-6 sm:mt-8 -mx-4 sm:mx-0 lg:hidden">
        <div className="px-4 sm:px-0">
          <div className="relative overflow-x-auto no-scrollbar snap-x snap-mandatory">
            <div className="flex gap-4 pr-6">
              {groups.map((g, gi) => (
                <div key={gi} className="shrink-0 w-[140vw] sm:w-[640px] h-[90vw] sm:h-[420px] snap-start">
                  {g.bigFirst ? (
                    <div className="grid grid-cols-3 grid-rows-6 gap-2 h-full">
                      {/* Big portrait left spans full height */}
                      <figure className="group col-span-1 row-span-6">
                        <div className="relative rounded-2xl overflow-hidden h-full">
                          <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                        </div>
                      </figure>
                      {/* Right column: top banner + two small */}
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
                      {/* Left side: banner + two small */}
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
                      {/* Big portrait right spans full height */}
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
      </div>

      {/* Large screens: precise grid with matched heights (no scroll) */}
      <div className="mt-8 hidden lg:block">
        <div className="space-y-10 max-w-5xl mx-auto">
          {groups.map((g, gi) => (
            <div key={gi} className="grid grid-cols-3 grid-rows-6 gap-4 h-[520px] xl:h-[560px]">
              {g.bigFirst ? (
                <>
                  {/* Big portrait left spans full height */}
                  <figure className="group col-span-1 row-span-6">
                    <div className="relative rounded-2xl overflow-hidden h-full">
                      <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                    </div>
                  </figure>
                  {/* Right: banner on top, two images below */}
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
                </>
              ) : (
                <>
                  {/* Left: banner on top, two images below */}
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
                  {/* Big portrait right spans full height */}
                  <figure className="group col-span-1 row-span-6">
                    <div className="relative rounded-2xl overflow-hidden h-full">
                      <img src={images[g.idx[0]].src} alt="Galerija frizerski salon" className="absolute inset-0 h-full w-full object-cover object-center" />
                    </div>
                  </figure>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
