# Frontend

Premium crno–zlatni UI za zakazivanje kod frizera. Napisan u React + Vite + Tailwind, sa React Router navigacijom.

## Stranice
- Početna (`/`): Hero, uputstvo i CTA za rezervaciju
- Rezervacija (`/book`): 3 koraka – usluga, termin, podaci
- Admin (`/admin`): pregled i uređivanje (radno vreme, neradni dani, interval, usluge, zakazivanja)
- Login (`/login`): prijava za frizera

## API
Podešeno preko `src/lib/api.js`. Podrazumeva bazni put preko `VITE_API_BASE` (podrazumevano `/backend`).

## Pokretanje
- Dev: `npm run dev`
- Build: `npm run build`

Ako backend radi na MAMP-u pod istim hostom, proxy u `vite.config.js` omogućava pozive ka `/backend/*`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
