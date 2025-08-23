import { useEffect, useMemo, useState } from 'react'
import { api, formatPrice } from '../lib/api'

function Stepper({ step }) {
  const items = [
    { n: 1, label: 'Usluga' },
    { n: 2, label: 'Datum i termin' },
    { n: 3, label: 'Podaci' },
  ]
  return (
    <ol className="flex items-center gap-2 text-xs sm:text-sm">
      {items.map((it, idx) => (
        <li key={it.n} className="flex items-center gap-2">
          <span className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border ${step>it.n? 'bg-yellow-500 text-black border-yellow-500' : step===it.n? 'border-yellow-500 text-yellow-400' : 'border-zinc-700 text-zinc-400'}`}>{it.n}</span>
          <span className={`${step>=it.n? 'text-yellow-400' : 'text-zinc-400'}`}>{it.label}</span>
          {idx < items.length-1 && <span className="mx-2 h-px w-8 sm:w-10 bg-zinc-800 hidden sm:block" />}
        </li>
      ))}
    </ol>
  )
}

function ServiceCard({ s, selected, onSelect }) {
  return (
    <button type="button" onClick={onSelect} className={`text-left p-4 rounded-xl border transition w-full ${selected? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-zinc-100">{s.name}</div>
          <div className="text-xs text-zinc-400 mt-1">Trajanje: {s.duration_minutes} min</div>
        </div>
        <div className="text-yellow-400 font-bold">{formatPrice(s.price)}</div>
      </div>
    </button>
  )
}

export default function Booking() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    api.services().then(setServices).catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    if (!date) { setSlots([]); setTime(''); return }
    setLoadingSlots(true)
    setError('')
    api.availability(date)
      .then(res => setSlots(res.slots || []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingSlots(false))
  }, [date])

  const canNext1 = !!serviceId
  const canNext2 = !!(date && time)
  const canSubmit = useMemo(() => !!(serviceId && date && time && name && phone), [serviceId, date, time, name, phone])

  const next = () => setStep(s => Math.min(3, s+1))
  const back = () => setStep(s => Math.max(1, s-1))

  const submit = async (e) => {
    e.preventDefault()
    setStatus('')
    setError('')
    try {
      const res = await api.createBooking({ service_id: Number(serviceId), customer_name: name, customer_phone: phone, date, time })
      setStatus(`Rezervacija uspešna. ID: ${res.booking_id}`)
      setStep(1); setServiceId(null); setDate(''); setTime(''); setName(''); setPhone('')
    } catch (e) { setError(e.message) }
  }

  const service = services.find(s => Number(s.id) === Number(serviceId))

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <h1 className="text-2xl font-bold text-yellow-400">Rezervacija</h1>
        <Stepper step={step} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 sm:gap-8">
        <section className="lg:col-span-2 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-6">
          {step === 1 && (
            <div>
              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest text-zinc-400">Korak 1</div>
                <h2 className="text-xl font-bold text-yellow-400">Izaberite uslugu</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {services.length === 0 && (
                  <div className="text-sm text-zinc-400">Trenutno nema dostupnih usluga.</div>
                )}
                {services.map(s => (
                  <ServiceCard key={s.id} s={s} selected={Number(serviceId)===s.id} onSelect={() => setServiceId(s.id)} />
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button disabled={!canNext1} onClick={next} className="tap px-5 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Nastavi</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest text-zinc-400">Korak 2</div>
                <h2 className="text-xl font-bold text-yellow-400">Odaberite datum i termin</h2>
              </div>
              <div className="grid gap-4">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
                {loadingSlots ? (
                  <div className="text-zinc-400 text-sm">Učitavanje termina…</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {(!date || slots.length === 0) && (
                      <div className="col-span-full text-sm text-zinc-400">{date? 'Nema dostupnih termina za izabrani dan.' : 'Izaberite datum.'}</div>
                    )}
                    {slots.map(t => (
                      <button type="button" key={t} onClick={()=>setTime(t)} className={`tap px-3 py-2 rounded-lg text-sm border transition ${time===t ? 'bg-yellow-500 text-black border-yellow-500' : 'border-zinc-800 hover:border-zinc-700'}`}>{t.slice(0,5)}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between gap-3">
                <button onClick={back} className="tap px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700">Nazad</button>
                <button disabled={!canNext2} onClick={next} className="tap px-5 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Nastavi</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest text-zinc-400">Korak 3</div>
                <h2 className="text-xl font-bold text-yellow-400">Vaši podaci</h2>
              </div>
              <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-300 mb-1">Ime i prezime</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-300 mb-1">Telefon</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full tap rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
                </div>
                <div className="md:col-span-2 flex items-center gap-4 mt-2">
                  <div className="text-sm text-zinc-400">Proverite podatke i potvrdite rezervaciju.</div>
                  <div className="flex-1" />
                  <button type="button" onClick={back} className="tap px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700">Nazad</button>
                  <button disabled={!canSubmit} className="tap px-5 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Rezerviši</button>
                </div>
                {error && <div className="md:col-span-2 text-sm text-red-400">{error}</div>}
                {status && <div className="md:col-span-2 text-sm text-emerald-400">{status}</div>}
              </form>
            </div>
          )}
        </section>

        <aside className="bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-2xl p-5 sm:p-6 h-max lg:sticky lg:top-24">
          <h3 className="font-semibold text-yellow-400">Rezime</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-zinc-400">Usluga</span><span className="text-zinc-100">{service?.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Trajanje</span><span className="text-zinc-100">{service? `${service.duration_minutes} min` : '-'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Cena</span><span className="text-yellow-400">{service? formatPrice(service.price) : '-'}</span></div>
            <div className="h-px bg-zinc-800 my-2" />
            <div className="flex justify-between"><span className="text-zinc-400">Datum</span><span className="text-zinc-100">{date || '-'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Termin</span><span className="text-zinc-100">{time? time.slice(0,5) : '-'}</span></div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom sticky summary */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 pb-safe">
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <div className="rounded-2xl border border-zinc-800 glass p-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="text-sm flex-1 space-y-1">
                <div className="flex justify-between"><span className="text-zinc-400">Usluga</span><span className="text-zinc-100">{service?.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Datum</span><span className="text-zinc-100">{date || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Termin</span><span className="text-zinc-100">{time? time.slice(0,5) : '-'}</span></div>
              </div>
              {step < 3 ? (
                <button onClick={next} disabled={(step===1 && !canNext1) || (step===2 && !canNext2)} className="tap px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold disabled:opacity-50">
                  Nastavi
                </button>
              ) : (
                <button onClick={submit} disabled={!canSubmit} className="tap px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold disabled:opacity-50">
                  Rezerviši
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
