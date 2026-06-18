# Frontend — cv-alerts-frontend (Next.js on Vercel)

The dashboard UI. Talks ONLY to our backend (NEVER the CV center). See root CLAUDE.md and
`.claude/skills/dashboard-ui/SKILL.md`.

## Screens
- KPI strip (active alerts by severity, assets monitored, silent devices, last refresh).
- Alerts page (CORE): filter/sort the three alert types; detail panel with evidence,
  rationale, compliance ref, recommended action.
- Communication graph (Cytoscape.js): asset-to-asset flows; highlight alert-involved nodes.
- Trends (Recharts): alert volume / severity distribution.

## Rules
- All data via `NEXT_PUBLIC_API_BASE_URL` (our backend). No CV token anywhere client-side.
- Shared TS interfaces mirror backend Pydantic models.
- Consistent severity tokens. Mandatory loading / empty / error states.
- Poll backend every 15–30s; show "last updated"; handle Render cold-start "waking up" state.

## Suggested layout
```
app/ or pages/      # Next.js routes
components/          # SeverityChip, AlertRow, AlertDetail, KpiCard, GraphCanvas, Trends
lib/api.ts          # typed fetch wrappers to the backend
lib/types.ts        # shared interfaces
```
