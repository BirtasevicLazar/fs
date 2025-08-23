import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, formatPrice } from '../lib/api'

const dayNames = ['Ponedeljak','Utorak','Sreda','Četvrtak','Petak','Subota','Nedelja']

function Tabs({ value, onChange, items }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-zinc-800 mb-6">
      {items.map((it) => (
        <button key={it.value} onClick={() => onChange(it.value)} className={`px-4 py-2 rounded-t-lg border ${value===it.value ? 'border-yellow-500 border-b-black bg-zinc-950 text-yellow-400' : 'border-transparent hover:text-yellow-300 text-zinc-300'}`}>{it.label}</button>
      ))}
    </div>
  )
}

function Section({ title, children, actions }) {
  return (
    <section className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
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

  const logout = async () => {
    try { await api.logout(); nav('/login') } catch {}
  }

  if (!me) return null

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Admin panel</h1>
        <div className="ml-auto text-sm text-zinc-400">Prijavljeni: {me.user?.username}</div>
        <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-500 text-zinc-200">Odjava</button>
      </div>

      <Tabs value={tab} onChange={setTab} items={[
        { value: 'bookings', label: 'Zakazivanja' },
        { value: 'hours', label: 'Radno vreme' },
        { value: 'days', label: 'Neradni dani' },
        { value: 'services', label: 'Usluge' },
        { value: 'settings', label: 'Podešavanja' },
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

  const load = async () => {
    setLoading(true); setError('')
    try { setItems(await api.bookingsForDate(date)) } catch(e){ setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() // eslint-disable-next-line
  }, [date])

  const setStatus = async (id, status) => { await api.updateBooking({ id, status }); load() }
  const remove = async (id) => { if (confirm('Obrisati termin?')) { await api.deleteBooking(id); load() } }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500" />
        <button onClick={load} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-500">Osveži</button>
      </div>
      {loading ? <div className="text-zinc-400">Učitavanje…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="text-left p-2">Vreme</th>
                <th className="text-left p-2">Usluga</th>
                <th className="text-left p-2">Trajanje</th>
                <th className="text-left p-2">Cena</th>
                <th className="text-left p-2">Klijent</th>
                <th className="text-left p-2">Telefon</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr key={b.id} className="border-t border-zinc-800">
                  <td className="p-2">{b.time?.slice(0,5)}</td>
                  <td className="p-2">{b.service_name}</td>
                  <td className="p-2">{b.duration_minutes} min</td>
                  <td className="p-2">{formatPrice(b.price)}</td>
                  <td className="p-2">{b.customer_name}</td>
                  <td className="p-2">{b.customer_phone}</td>
                  <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs ${b.status==='canceled'?'bg-red-900/40 text-red-300': b.status==='confirmed'?'bg-emerald-900/40 text-emerald-300':'bg-zinc-800 text-zinc-200'}`}>{b.status}</span></td>
                  <td className="p-2 flex gap-2">
                    <button onClick={()=>setStatus(b.id,'confirmed')} className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-emerald-400 text-emerald-300">Potvrdi</button>
                    <button onClick={()=>setStatus(b.id,'canceled')} className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-yellow-400 text-yellow-300">Otkaži</button>
                    <button onClick={()=>remove(b.id)} className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-300">Obriši</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-3 text-zinc-400" colSpan={8}>Nema zakazanih termina.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {error && <div className="text-red-400 mt-3">{error}</div>}
    </section>
  )
}

function HoursTab() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const list = await api.workingHours()
      // Normalize into map day-> {start_time,end_time}
      const map = new Map(list.map(r => [r.day_of_week, r]))
      const out = Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i+1,
        start_time: map.get(i+1)?.start_time || '',
        end_time: map.get(i+1)?.end_time || '',
      }))
      setRows(out)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const save = async (d) => {
    try {
      if (!d.start_time || !d.end_time) { await api.clearWorkingDay(d.day_of_week) }
      else { await api.setWorkingHours({ day_of_week: d.day_of_week, start_time: d.start_time, end_time: d.end_time }) }
      load()
    } catch (e) { setError(e.message) }
  }

  return (
    <section className="grid md:grid-cols-2 gap-4">
      {rows.map((d, idx) => (
        <div key={d.day_of_week} className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
          <div className="font-medium text-yellow-400">{dayNames[idx]}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input type="time" value={d.start_time} onChange={e=>setRows(r => r.map(x => x.day_of_week===d.day_of_week?{...x, start_time:e.target.value}:x))} className="rounded-lg bg-black border border-zinc-800 px-3 py-2" />
            <input type="time" value={d.end_time} onChange={e=>setRows(r => r.map(x => x.day_of_week===d.day_of_week?{...x, end_time:e.target.value}:x))} className="rounded-lg bg-black border border-zinc-800 px-3 py-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>save(d)} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-500">Sačuvaj</button>
            <button onClick={()=>save({ ...d, start_time:'', end_time:'' })} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-300">Obriši dan</button>
          </div>
        </div>
      ))}
      {error && <div className="text-red-400">{error}</div>}
    </section>
  )
}

function DaysOffTab() {
  const [items, setItems] = useState([])
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  const load = async () => setItems(await api.daysOff())
  useEffect(() => { load() }, [])

  const add = async () => { await api.addDayOff({ date, reason }); setDate(''); setReason(''); load() }
  const remove = async (id) => { if (confirm('Ukloniti neradni dan?')) { await api.removeDayOff(id); load() } }

  return (
    <section>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <div className="text-sm text-zinc-300">Datum</div>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm text-zinc-300">Razlog (opciono)</div>
          <input value={reason} onChange={e=>setReason(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-2" />
        </div>
        <button disabled={!date} onClick={add} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Dodaj</button>
      </div>

      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {items.map(d => (
          <div key={d.id} className="flex items-center gap-4 p-4">
            <div className="font-medium text-zinc-100">{d.date}</div>
            <div className="text-sm text-zinc-400">{d.reason}</div>
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
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('30')

  const load = async () => setItems(await api.adminServices('?all=1'))
  useEffect(() => { load() }, [])

  const add = async () => { await api.setService({ name, price: Number(price), duration_minutes: Number(duration) }); setName(''); setPrice(''); setDuration('30'); load() }
  const toggleActive = async (svc) => { await api.updateService({ id: svc.id, active: svc.active ? 0 : 1 }); load() }
  const update = async (svc, patch) => { await api.updateService({ id: svc.id, ...patch }); load() }
  const remove = async (svc) => { if (confirm('Obrisati uslugu?')) { await api.deleteService(svc.id); load() } }

  return (
    <section>
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input placeholder="Naziv" value={name} onChange={e=>setName(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2" />
        <input placeholder="Cena" value={price} onChange={e=>setPrice(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2" />
        <select value={duration} onChange={e=>setDuration(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2">
          {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n} min</option>)}
        </select>
        <button disabled={!name||!price} onClick={add} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">Dodaj uslugu</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left p-2">Naziv</th>
              <th className="text-left p-2">Cena</th>
              <th className="text-left p-2">Trajanje</th>
              <th className="text-left p-2">Aktivna</th>
              <th className="text-left p-2">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} className="border-t border-zinc-800">
                <td className="p-2">
                  <input value={s.name} onChange={e=>update(s,{ name: e.target.value })} className="rounded-lg bg-black border border-zinc-800 px-3 py-1" />
                </td>
                <td className="p-2 w-40">
                  <input value={s.price} onChange={e=>update(s,{ price: Number(e.target.value) })} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-1" />
                </td>
                <td className="p-2 w-40">
                  <select value={s.duration_minutes} onChange={e=>update(s,{ duration_minutes: Number(e.target.value) })} className="w-full rounded-lg bg-black border border-zinc-800 px-3 py-1">
                    {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n} min</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <button onClick={()=>toggleActive(s)} className={`px-2 py-1 rounded ${s.active? 'bg-emerald-900/40 text-emerald-300' : 'bg-zinc-800 text-zinc-200'}`}>{s.active? 'Da' : 'Ne'}</button>
                </td>
                <td className="p-2">
                  <button onClick={()=>remove(s)} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-300">Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <section className="max-w-md">
      <div className="space-y-2">
        <label className="block text-sm text-zinc-300">Interval termina</label>
        <select value={interval} onChange={e=>setInterval(e.target.value)} className="rounded-lg bg-black border border-zinc-800 px-3 py-2">
          {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n} minuta</option>)}
        </select>
      </div>
      <button onClick={save} className="mt-4 px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400">Sačuvaj</button>
      {status && <div className="mt-3 text-sm text-emerald-400">{status}</div>}
      {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
    </section>
  )
}
