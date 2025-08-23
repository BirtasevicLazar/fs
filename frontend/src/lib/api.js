// Normalize base to avoid trailing slashes causing "//" in URLs
const base = (import.meta.env.VITE_API_BASE || '/backend').replace(/\/+$/, '')

async function handle(res) {
  if (!res.ok) {
    let err
    try { err = await res.json() } catch { /* noop */ }
    throw new Error(err?.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // public
  services: () => fetch(`${base}/public/services.php`).then(handle),
  availability: (date) => fetch(`${base}/public/availability.php?date=${encodeURIComponent(date)}`).then(handle),
  createBooking: (payload) => fetch(`${base}/public/bookings.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handle),

  // auth
  me: () => fetch(`${base}/auth/me.php`, { credentials: 'include' }).then(handle),
  login: (payload) => fetch(`${base}/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  }).then(handle),
  logout: () => fetch(`${base}/auth/logout.php`, { method: 'POST', credentials: 'include' }).then(handle),

  // admin
  adminServices: (params = '') => fetch(`${base}/admin/services.php${params}`, { credentials: 'include' }).then(handle),
  setService: (payload) => fetch(`${base}/admin/services.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
  }).then(handle),
  updateService: (payload) => fetch(`${base}/admin/services.php`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
  }).then(handle),
  deleteService: (id) => fetch(`${base}/admin/services.php`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id })
  }).then(handle),

  workingHours: () => fetch(`${base}/admin/working_hours.php`, { credentials: 'include' }).then(handle),
  setWorkingHours: (payload) => fetch(`${base}/admin/working_hours.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
  }).then(handle),
  clearWorkingDay: (day) => fetch(`${base}/admin/working_hours.php`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ day_of_week: day })
  }).then(handle),

  daysOff: () => fetch(`${base}/admin/days_off.php`, { credentials: 'include' }).then(handle),
  addDayOff: (payload) => fetch(`${base}/admin/days_off.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
  }).then(handle),
  removeDayOff: (id) => fetch(`${base}/admin/days_off.php`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id })
  }).then(handle),

  settings: () => fetch(`${base}/admin/settings.php`, { credentials: 'include' }).then(handle),
  updateSettings: (payload) => fetch(`${base}/admin/settings.php`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
  }).then(handle),

  bookingsForDate: (date) => fetch(`${base}/public/bookings.php?date=${encodeURIComponent(date)}`, { credentials: 'include' }).then(handle),
  updateBooking: (payload) => fetch(`${base}/public/bookings.php`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
  }).then(handle),
  deleteBooking: (id) => fetch(`${base}/public/bookings.php`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id })
  }).then(handle),
}

export function formatPrice(n) {
  if (n == null) return ''
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(n)
}
