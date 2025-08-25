import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, formatPrice } from '../lib/api'

// Minimal date formatter for summary (YYYY-MM-DD -> DD.MM.YYYY)
function fmtDate(d) {
  if (!d) return '-'
  const parts = String(d).split('-')
  if (parts.length !== 3) return d
  const [y, m, day] = parts
  return `${day}.${m}.${y}.`
}

function Stepper({ step }) {
  const items = [
    { n: 1, label: 'Usluga', short: 'Usluga' },
    { n: 2, label: 'Datum i termin', short: 'Termin' },
    { n: 3, label: 'Podaci', short: 'Podaci' },
  ]
  const progress = ((Math.max(1, Math.min(3, step)) - 1) / (items.length - 1)) * 100
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Mobile segmented stepper */}
      <ol className="sm:hidden grid grid-cols-3 gap-2 w-full text-center" role="list">
        {items.map((it) => {
          const state = step > it.n ? 'done' : step === it.n ? 'active' : 'todo'
          const circleClass =
            state === 'done'
              ? 'bg-yellow-500 text-black border-yellow-500'
              : state === 'active'
              ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
              : 'border-zinc-700 text-zinc-400'
          const labelClass = state !== 'todo' ? 'text-yellow-400' : 'text-zinc-400'
          return (
            <li key={it.n} className="flex flex-col items-center" role="listitem" aria-current={state==='active' ? 'step' : undefined}>
              <span className={`h-7 w-7 flex items-center justify-center rounded-full border transition ${circleClass}`}>{it.n}</span>
              <span className={`mt-1 text-[11px] leading-tight ${labelClass}`}>{it.short}</span>
            </li>
          )
        })}
      </ol>
      <div className="sm:hidden mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full gold-gradient transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Desktop stepper */}
      <ol className="hidden sm:flex w-full justify-center items-center gap-3 text-sm" role="list">
        {items.map((it, idx) => (
          <li key={it.n} className="flex items-center gap-2" role="listitem" aria-current={step===it.n ? 'step' : undefined}>
            <span
              className={`h-8 w-8 flex items-center justify-center rounded-full border transition ${
                step > it.n
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : step === it.n
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  : 'border-zinc-700 text-zinc-400'
              }`}
            >
              {it.n}
            </span>
            <span className={`${step >= it.n ? 'text-yellow-400' : 'text-zinc-400'} whitespace-nowrap`}>{it.label}</span>
            {idx < items.length - 1 && (
              <span className={`mx-2 h-px w-10 md:w-16 ${step > it.n ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ServiceCard({ s, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
  className={`text-left p-4 rounded-xl border transition w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/30 ${selected ? 'border-yellow-500' : 'border-zinc-800 hover:border-zinc-700'}`}
    >
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
  const navigate = useNavigate()
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
  const [successId, setSuccessId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [redirectTimer, setRedirectTimer] = useState(null)

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

  const next = () => { setError(''); setStatus(''); setStep(s => Math.min(3, s+1)) }
  const back = () => { setError(''); setStatus(''); setStep(s => Math.max(1, s-1)) }

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setStatus('')
    setError('')
    try {
      const res = await api.createBooking({ service_id: Number(serviceId), customer_name: name, customer_phone: phone, date, time })
      setSuccessId(res.booking_id)
      setShowSuccess(true)
      // Reset form for next time
      setStep(1); setServiceId(null); setDate(''); setTime(''); setName(''); setPhone('')
    } catch (e) { setError(e.message) }
  }

  // Auto-redirect to home after success modal shows
  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => navigate('/', { replace: true }), 2200)
      setRedirectTimer(t)
      return () => clearTimeout(t)
    }
    return undefined
  }, [showSuccess, navigate])

  const service = services.find(s => Number(s.id) === Number(serviceId))

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-32 md:pb-36 lg:pb-10">
      <div className="mb-6 sm:mb-8 flex flex-col items-center gap-3 text-center">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {services.length === 0 && (
                  <div className="text-sm text-zinc-400">Trenutno nema dostupnih usluga.</div>
                )}
                {services.map(s => (
                  <ServiceCard
                    key={s.id}
                    s={s}
                    selected={Number(s.id) === Number(serviceId)}
                    onSelect={() => setServiceId(s.id)}
                  />
                ))}
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
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTime(t)}
                        className={`tap h-10 px-3 rounded-lg text-sm border transition flex items-center justify-center ${
                          time === t ? 'bg-yellow-500 text-black border-yellow-500' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {t.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                )}
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
        <div className="md:col-span-2 text-sm text-zinc-400 mt-1">Proverite podatke i potvrdite rezervaciju pomoću dugmadi u donjoj traci.</div>
                {error && <div className="md:col-span-2 text-sm text-red-400">{error}</div>}
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
            <div className="flex justify-between"><span className="text-zinc-400">Datum</span><span className="text-zinc-100">{fmtDate(date)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Termin</span><span className="text-zinc-100">{time ? time.slice(0, 5) : '-'}</span></div>
          </div>
          {/* Desktop actions */}
          <div className="hidden lg:block mt-6 pt-4 border-t border-zinc-800">
            <div className="text-sm flex items-center justify-between mb-3">
              <span className="text-zinc-400">Ukupno</span>
              <span className="text-yellow-400 font-semibold">{service ? formatPrice(service.price) : '-'}</span>
            </div>
            {step < 3 ? (
              <button
                onClick={next}
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                className="tap w-full px-4 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-50"
              >
                Nastavi
              </button>
            ) : (
              <button
                onClick={() => submit()}
                disabled={!canSubmit}
                className="tap w-full px-4 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-50"
              >
                Rezerviši
              </button>
            )}
            <button
              onClick={back}
              disabled={step === 1}
              className="tap w-full mt-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-50"
            >
              Nazad
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile bottom sticky action bar (above footer) */}
      <div className="fixed bottom-0 inset-x-0 z-50 pb-safe lg:hidden">
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <div className="rounded-2xl border border-zinc-800 glass p-2 sm:p-2.5 shadow-2xl">
            <div className="flex items-center gap-2.5">
              {/* Back arrow (left) */}
              <button
                onClick={back}
                disabled={step===1}
                aria-label="Nazad"
                className="tap h-10 w-10 grid place-items-center rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-zinc-200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>

              {/* Compact summary (center) */}
              <div className="flex-1 min-w-0 leading-tight">
                {(!service && !date && !time) ? (
                  <>
                    <div className="text-[13px] font-medium text-zinc-300 truncate">Niste još izabrali</div>
                    <div className="text-[11px] text-zinc-500 truncate">Odaberite uslugu, datum i termin</div>
                  </>
                ) : (
                  <>
                    <div className="text-[13px] font-medium text-zinc-100 truncate">{service?.name || '—'}</div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {date ? fmtDate(date) : '—'}
                      {date && time && <span className="mx-1">·</span>}
                      {time ? time.slice(0,5) : (date ? '' : '')}
                    </div>
                  </>
                )}
              </div>

              {/* Primary CTA (right) */}
              {step < 3 ? (
                <button
                  onClick={next}
                  disabled={(step===1 && !canNext1) || (step===2 && !canNext2)}
                  className="tap h-10 px-3 rounded-xl bg-yellow-500 text-black font-semibold disabled:opacity-50 whitespace-nowrap"
                >
                  Napred
                </button>
              ) : (
                <button
                  onClick={() => submit()}
                  disabled={!canSubmit}
                  className="tap h-10 px-3 rounded-xl bg-yellow-500 text-black font-semibold disabled:opacity-50 whitespace-nowrap"
                >
                  Rezerviši
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 glass p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-yellow-500 text-black flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div className="text-lg font-semibold text-zinc-100">Rezervacija uspešna</div>
            {successId && <div className="mt-1 text-sm text-zinc-400">ID rezervacije: <span className="text-zinc-200">{successId}</span></div>}
            <div className="mt-3 text-sm text-zinc-400">Preusmeravamo vas na početnu…</div>
            <div className="mt-5 flex justify-center gap-3">
              <button onClick={() => { setShowSuccess(false); navigate('/', { replace: true }) }} className="tap px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold">Na početnu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
