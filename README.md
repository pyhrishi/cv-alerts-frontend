# cv-alerts-frontend

Next.js + TypeScript + Tailwind dashboard for the Cisco Cyber Vision **alert experience**: a
severity-ranked **Alerts** page with evidence/rationale/recommended-action detail, a Purdue-layered
**communication-relations graph** (Cytoscape) with alert blast-radius highlighting, a sortable
**Report** table (CSV/print), and **KPI + Trends** charts.

> ⚠️ Thin client. It talks **only** to our backend API (`NEXT_PUBLIC_API_BASE_URL`) and **never** to the
> Cyber Vision Center directly — the CV token stays server-side.

## Live
- **Dashboard:** https://cv-alerts-frontend.vercel.app
- **Backend API:** https://cv-alerts-backend-1.onrender.com

> ⏳ **First load may take ~30–60s** while the free-tier backend wakes from idle. The dashboard shows a
> **"Waking the backend…"** state and recovers automatically — it is not a failure.
>
> 🟡 The public demo runs against the backend in **snapshot** mode (frozen sample data, no live Center
> connection). The badge top-left reads **"Snapshot"**; it flips to **"Live"** when pointed at a backend
> in live mode. The badge always reflects the true data source.

## Setup / run (from a fresh clone)
Requires Node 18+ (developed on Node 24). A backend must be reachable (local or the live URL above).
```bash
npm install

# point at a backend
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local   # or the live Render URL

npm run dev          # dev server -> http://localhost:3000
# or
npm run build && npm run start   # production build + serve
```
`npm run build` type-checks and lints the whole app. `.env.local` is gitignored; the only variable is the
public backend URL (not a secret).

## How it works
- `lib/types.ts` mirrors the backend Pydantic models; `lib/api.ts` is the single typed fetch boundary.
- `lib/tokens.ts` defines severity + zone colors **once** (used by chips, KPI segments, graph, charts).
- `lib/useDashboardData.ts` polls every 20s, stamps "last updated", and drives the loading / empty /
  error / cold-start "waking" states.
- Selecting an alert sets a shared id; the graph highlights exactly the nodes/edges whose `alert_ids`
  include it and dims the rest.

## System of record
All design docs, the alert engine, API findings, and the alert spec live in the backend repo:
**👉 https://github.com/pyhrishi/cv-alerts-backend** (start at `docs/SUBMISSION.md`).
