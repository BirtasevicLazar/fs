import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, formatPrice } from '../lib/api'

const dayNames = ['Ponedeljak','Utorak','Sreda','Četvrtak','Petak','Subota','Nedelja']

function Tabs({ value, onChange, items }) {
  return (
  <div className="relative mx-0 mb-6 mt-2">
      {/* horizontal scroller */}
      <div
        className="px-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
        role="tablist"
        onWheel={(e) => {
          if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
        }}
      >
        <div className="flex flex-nowrap gap-2 whitespace-nowrap py-1">
          {items.map((it) => (
            <button
              key={it.value}
              role="tab"
              aria-selected={value===it.value}
              onClick={() => onChange(it.value)}
              className={`snap-start px-3.5 py-1.5 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 font-medium ${
                value===it.value
                  ? 'bg-zinc-950/60 border-zinc-700 text-yellow-300 ring-1 ring-yellow-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'bg-zinc-950/30 border-zinc-800 text-zinc-300 hover:text-yellow-200 hover:border-zinc-700'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, actions }) {
  return (
  <section className="bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-400">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  )
}

export default function Admin() {
  const nav = useNavigate()
  const [tab, setTab] = useState('bookings')
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.me().then(setMe).catch(() => nav('/login'))
    return () => { mounted = false }
  }, [nav])

  if (!me) return null

  return (
  <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-2 sm:py-10">
    
      <Tabs value={tab} onChange={setTab} items={[
        { value: 'bookings', label: 'Zakazivanja' },
        { value: 'hours', label: 'Radno vreme' },
        { value: 'days', label: 'Neradni dani' },
        { value: 'services', label: 'Usluge' },
  { value: 'settings', label: 'Interval' },
      ]} />

      {tab === 'bookings' && <BookingsTab />}
      {tab === 'hours' && <HoursTab />}
      {tab === 'days' && <DaysOffTab />}
      {tab === 'services' && <ServicesTab />}
      {tab === 'settings' && <SettingsTab />}

      {error && <div className="text-red-400 mt-4">{error}</div>}
    </div>
  )
}

function BookingsTab() {
  const today = new Date().toISOString().slice(0,10)
  const [date, setDate] = useState(today)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [interval, setInterval] = useState(60)
  const [workingHours, setWorkingHours] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [savingAdd, setSavingAdd] = useState(false)
  const [services, setServices] = useState([])
  const [slotsFree, setSlotsFree] = useState([])
  const [addForm, setAddForm] = useState({ service_id: '', customer_name: '', customer_phone: '', time: '' })
  const ROW_H = 40 // px per slot row
  const TOP_PAD = 8 // px top padding to avoid clipping first row labels

  const load = async () => {
    setLoading(true); setError('')
    try { setItems(await api.bookingsForDate(date)) } catch(e){ setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() // eslint-disable-next-line
  }, [date])

  // Initial settings and working hours
  useEffect(() => {
    (async () => {
      try {
        const s = await api.settings().catch(() => ({}))
        if (s && s.slot_interval_minutes) setInterval(Number(s.slot_interval_minutes))
      } catch {}
      try { setWorkingHours(await api.workingHours()) } catch {}
    })()
  }, [])

  const setStatus = async (id, status) => { await api.updateBooking({ id, status }); load() }
  const remove = async (id) => { if (confirm('Obrisati termin?')) { await api.deleteBooking(id); load() } }

  // Helpers
  const toMin = (t) => {
    if (!t) return null
    const [H,M] = t.slice(0,5).split(':').map(Number)
    return H*60 + M
  }
  const toStr = (m) => {
    const H = Math.floor(m/60).toString().padStart(2,'0')
    const M = (m%60).toString().padStart(2,'0')
    return `${H}:${M}`
  }

  // Determine work start/end for selected date
  const dayIdx = (() => {
    const d = new Date(date)
    const js = d.getDay() // 0..6 (Sun..Sat)
    return js === 0 ? 7 : js // 1..7 (Mon..Sun)
  })()
  const dayWh = workingHours.find(w => Number(w.day_of_week) === dayIdx)
  const workStart = dayWh?.start_time || ''
  const workEnd = dayWh?.end_time || ''

  const slots = useMemo(() => {
    if (!workStart || !workEnd || !interval) return []
    const start = toMin(workStart)
    const end = toMin(workEnd)
    const out = []
    for (let m=start; m<end; m+=interval) out.push(toStr(m))
    return out
  }, [workStart, workEnd, interval])

  const bookingsBlocks = useMemo(() => {
    if (!slots.length) return []
    return items.map(b => {
      const startT = b.time?.slice(0,5)
      const row = slots.indexOf(startT)
      const dur = Number(b.duration_minutes) || interval
      const span = Math.max(1, Math.ceil(dur / interval))
  return { ...b, _row: row, _span: span }
    }).filter(b => b._row >= 0)
  }, [items, slots, interval])

  // Close modal with Escape
  useEffect(() => {
    if (!showModal) return
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  // Open Add modal: fetch services and free slots for current date
  useEffect(() => {
    if (!showAdd) return
    let cancelled = false
    ;(async () => {
      try {
        const [svcs, avail] = await Promise.all([
          api.services().catch(() => []),
          api.availability(date).catch(() => ({ slots: [] }))
        ])
        if (cancelled) return
        setServices(Array.isArray(svcs) ? svcs : [])
        const free = Array.isArray(avail?.slots) ? avail.slots : []
        setSlotsFree(free)
        setAddForm(f => ({
          ...f,
          service_id: f.service_id || (svcs?.[0]?.id ?? ''),
          time: f.time || (free?.[0] ?? '')
        }))
      } catch { /* noop */ }
    })()
    return () => { cancelled = true }
  }, [showAdd, date])

  // Close Add modal with Escape
  useEffect(() => {
    if (!showAdd) return
    const onKey = (e) => { if (e.key === 'Escape') setShowAdd(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAdd])

  const createBooking = async () => {
    const payload = {
      service_id: Number(addForm.service_id) || null,
      customer_name: addForm.customer_name?.trim(),
      customer_phone: addForm.customer_phone?.trim(),
      date,
      time: addForm.time
    }
    if (!payload.service_id || !payload.customer_name || !payload.customer_phone || !payload.time) return
    try {
      setSavingAdd(true)
      await api.createBooking(payload)
      setShowAdd(false)
      setAddForm({ service_id: '', customer_name: '', customer_phone: '', time: '' })
      load()
    } catch (e) { setError(e.message) }
    finally { setSavingAdd(false) }
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
        <button onClick={load} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-500">Osveži</button>
        <div className="ml-auto" />
        <button onClick={()=>setShowAdd(true)} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>Dodaj</span>
        </button>
      </div>
      {loading ? (
        <div className="text-zinc-400">Učitavanje…</div>
      ) : !workStart || !workEnd ? (
        <div className="text-sm text-zinc-400">Nema radnog vremena za odabrani dan.</div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-zinc-400">
            <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-yellow-900/40 border border-yellow-700 block"/> Zakazano</span>
            <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700 block"/> Potvrđeno</span>
            <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-red-900/30 border border-red-700 block"/> Otkazano</span>
          </div>
          <div className="relative rounded-xl border border-zinc-800 overflow-auto max-h-[70vh]">
            <div className="flex min-w-0">
              {/* Sticky time labels column */}
              <div
                className="sticky left-0 top-0 z-10 shrink-0 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-r border-zinc-800"
                style={{ width: 64 }}
              >
                <div className="grid" style={{ gridTemplateRows: `repeat(${slots.length}, ${ROW_H}px)`, marginTop: TOP_PAD }}>
                  {slots.map((t, idx) => (
                    <div key={`lbl-${idx}`} className={`px-2 text-xs text-zinc-500 flex items-start justify-end select-none ${t.endsWith(':00') ? 'opacity-100' : 'opacity-0'}`}>
                      <span className="translate-y-[-6px]">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Lanes + bookings */}
              <div className="relative flex-1 min-w-0">
                {/* Base lines */}
                <div className="grid" style={{ gridTemplateRows: `repeat(${slots.length}, ${ROW_H}px)`, marginTop: TOP_PAD }}>
                  {slots.map((_, idx) => <div key={`ln-${idx}`} className="border-t border-zinc-900/60" />)}
                </div>
                {/* Overlay bookings */}
                <div className="absolute left-0 right-0 bottom-0 grid" style={{ gridTemplateRows: `repeat(${slots.length}, ${ROW_H}px)`, top: TOP_PAD }}>
                  {bookingsBlocks.map(b => (
                    <div
                      key={b.id}
                      className={`rounded-lg border px-3 py-2 mr-2 ml-2 overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-500/30 ${b.status==='canceled' ? 'bg-red-900/30 border-red-700' : b.status==='confirmed' ? 'bg-emerald-900/30 border-emerald-700' : 'bg-yellow-900/20 border-yellow-600'}`}
                      style={{ gridRow: `${b._row + 1} / span ${b._span}` }}
                      onClick={() => { setSelected(b); setShowModal(true) }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-[13px]">
                          <span className="text-zinc-100 font-medium">{b.service_name}</span>
                          <span className="text-zinc-400"> · {b.customer_name}</span>
                          <span className="text-zinc-500"> · {b.customer_phone}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 shrink-0">{b.time?.slice(0,5)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {error && <div className="text-red-400 mt-3">{error}</div>}

      {/* Booking details modal */}
      {showModal && selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 glass p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-zinc-100">{selected.service_name}</div>
                <div className="text-sm text-zinc-400">{selected.time?.slice(0,5)} · {selected.duration_minutes} min</div>
              </div>
              <button className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700" onClick={()=>setShowModal(false)} aria-label="Zatvori">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Klijent</span><span className="text-zinc-200">{selected.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Telefon</span><span className="text-zinc-200">{selected.customer_phone}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Cena</span><span className="text-yellow-400">{formatPrice(selected.price)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Status</span><span className={`text-zinc-200 px-2 py-0.5 rounded-full text-xs ${selected.status==='canceled'?'bg-red-900/40 text-red-300': selected.status==='confirmed'?'bg-emerald-900/40 text-emerald-300':'bg-zinc-800 text-zinc-200'}`}>{selected.status}</span></div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button onClick={()=>{ setShowModal(false); setStatus(selected.id,'confirmed') }} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-400 text-emerald-300">Potvrdi</button>
              <button onClick={()=>{ setShowModal(false); setStatus(selected.id,'canceled') }} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-400 text-yellow-300">Otkaži</button>
              <button onClick={()=>{ setShowModal(false); remove(selected.id) }} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-300">Obriši</button>
            </div>
          </div>
        </div>
      )}

      {/* Add booking modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>!savingAdd && setShowAdd(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 glass p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-zinc-100">Dodaj termin</div>
                <div className="text-sm text-zinc-400">Za datum {date}</div>
              </div>
              <button disabled={savingAdd} className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:opacity-50" onClick={()=>setShowAdd(false)} aria-label="Zatvori">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Usluga</label>
                <select value={addForm.service_id} onChange={e=>setAddForm(f=>({ ...f, service_id: e.target.value }))} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500">
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Ime i prezime</label>
                  <input value={addForm.customer_name} onChange={e=>setAddForm(f=>({ ...f, customer_name: e.target.value }))} placeholder="npr. Marko Marković" className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Telefon</label>
                  <input type="tel" value={addForm.customer_phone} onChange={e=>setAddForm(f=>({ ...f, customer_phone: e.target.value }))} placeholder="npr. +381601234567" className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Termin</label>
                {slotsFree.length ? (
                  <select value={addForm.time} onChange={e=>setAddForm(f=>({ ...f, time: e.target.value }))} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500">
                    {slotsFree.map(t => <option key={t} value={t}>{t.slice(0,5)}</option>)}
                  </select>
                ) : (
                  <div className="text-sm text-red-400">Nema slobodnih termina za ovaj dan.</div>
                )}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={savingAdd} onClick={()=>setShowAdd(false)} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 disabled:opacity-50">Odustani</button>
              <button disabled={savingAdd || !addForm.service_id || !addForm.customer_name || !addForm.customer_phone || !addForm.time} onClick={createBooking} className="tap px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2">
                {savingAdd && <span className="h-4 w-4 rounded-full border-2 border-black/60 border-t-transparent animate-spin" />}
                <span>Sačuvaj</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function HoursTab() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const toHM = (t) => (t ? t.slice(0,5) : '')
  const toHMS = (t) => (t && t.length===5 ? `${t}:00` : (t || ''))
  const toMin = (t) => { if (!t) return null; const [H,M] = t.split(':').map(Number); return H*60+M }
  const isValid = (d) => {
    if (!d.enabled) return true
    if (!d.start_time || !d.end_time) return false
    return toMin(d.end_time) > toMin(d.start_time)
  }
  const [confirmRow, setConfirmRow] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const load = async () => {
    try {
      const list = await api.workingHours()
      // Normalize into map day-> {start_time,end_time}
      const map = new Map(list.map(r => [Number(r.day_of_week), r]))
      const out = Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i+1,
        start_time: toHM(map.get(i+1)?.start_time || ''),
        end_time: toHM(map.get(i+1)?.end_time || ''),
        enabled: !!(map.get(i+1)?.start_time && map.get(i+1)?.end_time),
      }))
      setRows(out)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const save = async (d) => {
    try {
      if (!d.enabled) { await api.clearWorkingDay(d.day_of_week) }
      else { await api.setWorkingHours({ day_of_week: d.day_of_week, start_time: toHMS(d.start_time), end_time: toHMS(d.end_time) }) }
      load()
    } catch (e) { setError(e.message) }
  }

  // Close confirm with Escape
  useEffect(() => {
    if (!showConfirm) return
    const onKey = (e) => { if (e.key === 'Escape') setShowConfirm(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showConfirm])

  return (
    <section className="space-y-3">
      {rows.map((d, idx) => (
        <div key={d.day_of_week} className="rounded-xl border border-zinc-800 glass p-3 sm:p-4">
          {/* Header: day + switch */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-yellow-400 font-medium">{dayNames[idx]}</div>
            <div className="flex items-center gap-2">
              {!d.enabled && <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 sm:hidden">Neradni</span>}
              <button
                type="button"
                role="switch"
                aria-checked={d.enabled}
                onClick={() => setRows(r => r.map(x => x.day_of_week===d.day_of_week?{...x, enabled: !x.enabled}:x))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${d.enabled ? 'bg-yellow-500/80' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-black transition-transform ${d.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          {/* Inputs row */}
          <div className={`mt-2 grid grid-cols-2 gap-2 sm:flex sm:items-center ${!d.enabled ? 'opacity-50' : ''}`}>
            <input
              type="time"
              value={d.start_time}
              disabled={!d.enabled}
              onChange={e=>setRows(r => r.map(x => x.day_of_week===d.day_of_week?{...x, start_time:e.target.value}:x))}
              className={`w-full sm:w-[120px] rounded-lg border px-3 py-2 text-zinc-100 focus:outline-none ${isValid(d) ? 'bg-black/60 border-zinc-800 focus:border-yellow-500' : 'bg-black/60 border-red-600 focus:border-red-600'}`}
            />
            <input
              type="time"
              value={d.end_time}
              disabled={!d.enabled}
              onChange={e=>setRows(r => r.map(x => x.day_of_week===d.day_of_week?{...x, end_time:e.target.value}:x))}
              className={`w-full sm:w-[120px] rounded-lg border px-3 py-2 text-zinc-100 focus:outline-none ${isValid(d) ? 'bg-black/60 border-zinc-800 focus:border-yellow-500' : 'bg-black/60 border-red-600 focus:border-red-600'}`}
            />
            {!isValid(d) && d.enabled && (
              <div className="col-span-2 sm:ml-2 text-xs text-red-400">Kraj mora biti posle početka.</div>
            )}
          </div>
          {/* Actions row */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={()=>{ setConfirmRow(d); setShowConfirm(true) }}
              disabled={!isValid(d)}
              className={`text-sm px-3 py-2 rounded-lg border ${isValid(d) ? 'bg-zinc-950 border-zinc-800 hover:border-yellow-500 text-zinc-200' : 'bg-zinc-950 border-zinc-900 text-zinc-500 cursor-not-allowed'}`}
            >Sačuvaj</button>
          </div>
        </div>
      ))}
      {error && <div className="text-red-400">{error}</div>}
      {/* Confirm save modal */}
      {showConfirm && confirmRow && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setShowConfirm(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 glass p-5 sm:p-6 shadow-2xl">
            <div className="text-lg font-semibold text-zinc-100">Sačuvati radno vreme?</div>
            <div className="mt-2 text-sm text-zinc-400">
              <div className="font-medium text-zinc-200">{dayNames[(confirmRow.day_of_week||1)-1]}</div>
              {confirmRow.enabled ? (
                <div>Od <span className="text-zinc-200">{confirmRow.start_time}</span> do <span className="text-zinc-200">{confirmRow.end_time}</span></div>
              ) : (
                <div>Označeno kao <span className="text-zinc-200">neradni dan</span>.</div>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={()=>setShowConfirm(false)} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700">Odustani</button>
              <button onClick={()=>{ setShowConfirm(false); save(confirmRow) }} className="tap px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400">Da, sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function DaysOffTab() {
  const [items, setItems] = useState([])
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const existing = useMemo(() => new Set(items.map(d => d.date)), [items])
  const humanDate = (iso) => {
    if (!iso) return ''
    const [y,m,d] = iso.split('-')
    return `${d}.${m}.${y}`
  }

  const load = async () => setItems(await api.daysOff())
  useEffect(() => { load() }, [])

  const add = async () => { await api.addDayOff({ date, reason }); setDate(''); setReason(''); load() }
  const remove = async (id) => { if (confirm('Ukloniti neradni dan?')) { await api.removeDayOff(id); load() } }

  return (
    <section>
      {/* Add form card */}
      <div className="mb-4 rounded-xl border border-zinc-800 glass p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="sm:w-56">
            <label className="block text-xs text-zinc-400 mb-1">Datum</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 pl-9 pr-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
            </div>
            {date && existing.has(date) && (
              <div className="mt-1 text-xs text-red-400">Taj datum je već dodat.</div>
            )}
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-zinc-400 mb-1">Razlog (opciono)</label>
            <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="npr. odmor, servis, praznik…" className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
          </div>
          <div className="sm:ml-auto">
            <button disabled={!date || existing.has(date)} onClick={add} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Dodaj</button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 glass">
    {items.map(d => (
          <div key={d.id} className="flex items-center gap-4 p-4">
      <div className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-200" title={d.date}>{humanDate(d.date)}</div>
            <div className="text-sm text-zinc-400 truncate">{d.reason}</div>
            <div className="ml-auto" />
            <button onClick={()=>remove(d.id)} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-300">Ukloni</button>
          </div>
        ))}
        {items.length===0 && <div className="p-4 text-sm text-zinc-400">Nema neradnih dana.</div>}
      </div>
    </section>
  )
}

function ServicesTab() {
  // Local drafts
  const [rows, setRows] = useState([])
  const [orig, setOrig] = useState([])
  const [addForm, setAddForm] = useState({ name: '', price: '', duration_minutes: '30', active: 1 })
  const [confirmRow, setConfirmRow] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const data = await api.adminServices()
    const norm = data.map(d => ({ ...d, price: Number(d.price), duration_minutes: Number(d.duration_minutes), active: Number(d.active) }))
    setRows(norm)
    setOrig(norm)
  }
  useEffect(() => { load() }, [])

  // helpers
  const byId = useMemo(() => new Map(orig.filter(o=>o.id).map(o => [o.id, o])), [orig])
  const valid = (r) => r && r.name?.trim() && Number(r.price) >= 0 && [15,30,45,60,90,120].includes(Number(r.duration_minutes))
  const changed = (r) => {
    if (!r) return false
    if (!r.id) return valid(r)
    const o = byId.get(r.id)
    if (!o) return valid(r)
    return (
      r.name !== o.name ||
      Number(r.price) !== Number(o.price) ||
      Number(r.duration_minutes) !== Number(o.duration_minutes) ||
      Number(r.active) !== Number(o.active)
    )
  }

  // Close confirm with Escape
  useEffect(() => {
    if (!showConfirm) return
    const onKey = (e) => { if (e.key === 'Escape') setShowConfirm(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showConfirm])

  const addLocal = () => {
    if (!addForm.name || addForm.price === '') return
    const newRow = { id: undefined, name: addForm.name, price: Number(addForm.price), duration_minutes: Number(addForm.duration_minutes||30), active: Number(addForm.active)?1:0, _tmp: true }
    setRows(r => [newRow, ...r])
    setAddForm({ name: '', price: '', duration_minutes: '30', active: 1 })
  }

  const removeRow = (row) => {
    if (!row.id) { setRows(rs => rs.filter(x => x !== row)); return }
    if (confirm('Obrisati uslugu?')) { api.deleteService(row.id).then(load) }
  }

  const saveOne = async (row) => {
    if (!valid(row)) return
    setSaving(true)
    try {
      if (!row.id) {
        const res = await api.setService({ name: row.name, price: Number(row.price), duration_minutes: Number(row.duration_minutes) })
        const newId = res?.id
        if (newId && Number(row.active) !== 1) {
          await api.updateService({ id: newId, active: Number(row.active)?1:0 })
        }
      } else {
        const o = byId.get(row.id)
        const patch = {}
        if (row.name !== o.name) patch.name = row.name
        if (Number(row.price) !== Number(o.price)) patch.price = Number(row.price)
        if (Number(row.duration_minutes) !== Number(o.duration_minutes)) patch.duration_minutes = Number(row.duration_minutes)
        if (Number(row.active) !== Number(o.active)) patch.active = Number(row.active)
        if (Object.keys(patch).length) await api.updateService({ id: row.id, ...patch })
      }
      await load()
      setShowConfirm(false)
    } finally { setSaving(false) }
  }

  return (
    <section>
      {/* Add form */}
      <div className="mb-4 rounded-xl border border-zinc-800 glass p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Naziv</label>
            <input value={addForm.name} onChange={e=>setAddForm(f=>({...f, name:e.target.value}))} placeholder="npr. Šišanje" className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Cena</label>
            <input type="number" min="0" value={addForm.price} onChange={e=>setAddForm(f=>({...f, price:e.target.value}))} placeholder="0" className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Trajanje</label>
            <select value={addForm.duration_minutes} onChange={e=>setAddForm(f=>({...f, duration_minutes:e.target.value}))} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500">
              {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n} min</option>)}
            </select>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Aktivna</label>
              <button type="button" role="switch" aria-checked={!!Number(addForm.active)} onClick={()=>setAddForm(f=>({...f, active: Number(f.active)?0:1}))} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${Number(addForm.active)?'bg-yellow-500/80':'bg-zinc-700'}`}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform ${Number(addForm.active)?'translate-x-6':'translate-x-1'}`} />
              </button>
            </div>
            <button onClick={addLocal} disabled={!addForm.name || addForm.price===''} className="ml-auto px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Dodaj</button>
          </div>
        </div>
      </div>

      {/* Card list (mobile-first) */}
      <div className="space-y-3">
        {rows.map((s, idx) => (
          <div key={s.id ?? `new-${idx}`} className="rounded-xl border border-zinc-800 glass p-3">
            <div className="flex items-center justify-between gap-3">
              <input value={s.name} onChange={e=>setRows(r => r.map(x => x===s?{...x, name:e.target.value}:x))} className="flex-1 min-w-0 rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
              <button type="button" role="switch" aria-checked={!!Number(s.active)} onClick={()=>setRows(r => r.map(x => x===s?{...x, active: Number(x.active)?0:1}:x))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${Number(s.active)?'bg-emerald-500/70':'bg-zinc-700'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-black transition-transform ${Number(s.active)?'translate-x-5':'translate-x-1'}`} />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Cena</label>
                <input type="number" min="0" value={s.price} onChange={e=>setRows(r => r.map(x => x===s?{...x, price:Number(e.target.value)}:x))} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Trajanje</label>
                <select value={s.duration_minutes} onChange={e=>setRows(r => r.map(x => x===s?{...x, duration_minutes:Number(e.target.value)}:x))} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500">
                  {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n} min</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={()=>{ setConfirmRow(s); setShowConfirm(true) }}
                disabled={!changed(s) || !valid(s)}
                className={`px-3 py-2 rounded-lg border ${changed(s) && valid(s) ? 'bg-zinc-950 border-zinc-800 hover:border-yellow-500 text-zinc-200' : 'bg-zinc-950 border-zinc-900 text-zinc-500 cursor-not-allowed'}`}
              >Sačuvaj</button>
              <button onClick={()=>removeRow(s)} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-300">Obriši</button>
            </div>
          </div>
        ))}
        {rows.length===0 && <div className="text-sm text-zinc-400">Nema usluga.</div>}
      </div>

      {/* Save confirm modal (per row) */}
      {showConfirm && confirmRow && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setShowConfirm(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 glass p-5 sm:p-6 shadow-2xl">
            <div className="text-lg font-semibold text-zinc-100">Sačuvati uslugu?</div>
            <div className="mt-2 text-sm text-zinc-400">
              <div className="font-medium text-zinc-200">{confirmRow.name || 'Nova usluga'}</div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">{Number(confirmRow.price) || 0} RSD</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">{confirmRow.duration_minutes} min</span>
                <span className={`px-2 py-0.5 rounded ${Number(confirmRow.active)?'bg-emerald-900/40 text-emerald-300':'bg-zinc-800 text-zinc-300'}`}>{Number(confirmRow.active)?'Aktivna':'Neaktivna'}</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={saving} onClick={()=>setShowConfirm(false)} className="tap px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700">Odustani</button>
              <button disabled={saving || !valid(confirmRow)} onClick={()=>saveOne(confirmRow)} className="tap px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400">Da, sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function SettingsTab() {
  const [interval, setInterval] = useState('60')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try { const s = await api.settings(); if (s.slot_interval_minutes) setInterval(String(s.slot_interval_minutes)) } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    try { setStatus(''); await api.updateSettings({ slot_interval_minutes: Number(interval) }); setStatus('Sačuvano') } catch (e) { setError(e.message) }
  }

  return (
    <section className="max-w-xl">
      <div className="rounded-xl border border-zinc-800 glass p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
          <div>
            <div className="text-sm font-medium text-zinc-200">Interval termina</div>
            <div className="text-xs text-zinc-400">Određuje korak u kalendaru i trajanje slotova.</div>
          </div>
          <div className="ml-auto text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">Trenutno: {interval} min</div>
        </div>


        {/* Select fallback */}
        <div className="space-y-2">
          <label className="block text-xs text-zinc-400">Izaberi interval</label>
          <select value={interval} onChange={e=>setInterval(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500">
            {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n} minuta</option>)}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={save} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400">Sačuvaj</button>
        </div>

        {status && <div className="mt-3 text-sm text-emerald-400">{status}</div>}
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
      </div>
    </section>
  )
}
