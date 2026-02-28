## LagZero – Smart Gaming Network Stabilizer (Pro Gamer Dashboard)

Desktop-first futuristic dashboard UI for a system-level gaming network optimizer.

### Tech
- React + TypeScript
- TailwindCSS
- Recharts
- Electron-ready entrypoints (`electron/`)

### Local run(install all the dependencies before this)
```bash
npm install
npm run dev
```

### Connect to backend (optional)
- **simulation mode (default)**: do nothing
- **backend mode**: create `.env` from `.env.example` and set `VITE_LAGZERO_API_BASE` to your local REST gateway (example `http://127.0.0.1:7777`)

### Build
```bash
npm run build
npm run preview
```

### Electron (optional wrapper)
```bash
npm run electron:dev
```

