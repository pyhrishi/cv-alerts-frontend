# cv-alerts-frontend

Next.js + TypeScript dashboard for the Cisco Cyber Vision **New Alert Framework** (Cisco TPM /
AI Builder exercise). It renders the Alerts page, the asset **communication-relations graph**,
and KPI/trend charts.

> ⚠️ This is a thin client. It talks **only** to our backend API and **never** to the Cyber
> Vision Center directly — the CV API token stays server-side.

## System of record
All project documentation, the alert engine, the API findings, and the alert specification
live in the backend repository, which is the canonical source for this submission:

**👉 https://github.com/pyhrishi/cv-alerts-backend**

Start there for: architecture & design decisions, the live API discovery findings
(`docs/API-FINDINGS.md`), the three-alert contract (`docs/ALERT-SPEC.md`), the authored OT
baseline policy, and setup/testing instructions.

## Status
Scaffold only. The Next.js app is added in Phase 4, after the backend alert engine (Phase 2)
and REST API (Phase 3) are reviewed. It will consume the backend's `/alerts`, `/graph`, and
`/kpis` endpoints.

## Configuration
See [`.env.example`](.env.example) — the only variable is the backend base URL
(`NEXT_PUBLIC_API_BASE_URL`). No secrets are stored in this repo.
