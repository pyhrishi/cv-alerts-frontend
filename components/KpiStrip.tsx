import { SEVERITY, SEVERITY_ORDER } from "@/lib/tokens";
import type { KpisResponse } from "@/lib/types";

function Card({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-lg border border-ot-border bg-ot-surface px-4 py-3 shadow-panel">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ot-muted">{label}</div>
      <div className="mt-1" style={accent ? { color: accent } : undefined}>{children}</div>
    </div>
  );
}

export function KpiStrip({ kpis }: { kpis: KpisResponse }) {
  const sev = kpis.active_alerts_by_severity;
  const total = kpis.active_alerts_total || 1;
  return (
    <div className="grid grid-cols-2 gap-3 px-5 py-4 md:grid-cols-3 xl:grid-cols-5">
      <Card label="Assets monitored">
        <div className="text-2xl font-semibold tabular-nums">{kpis.assets_monitored}</div>
      </Card>

      {/* active alerts with severity segments */}
      <div className="col-span-2 rounded-lg border border-ot-border bg-ot-surface px-4 py-3 shadow-panel md:col-span-1 xl:col-span-1">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wider text-ot-muted">Active alerts</div>
          <div className="text-2xl font-semibold tabular-nums">{kpis.active_alerts_total}</div>
        </div>
        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-ot-panel">
          {SEVERITY_ORDER.map((s) =>
            sev[s] ? (
              <div
                key={s}
                style={{ width: `${(sev[s] / total) * 100}%`, backgroundColor: SEVERITY[s].hex }}
                title={`${SEVERITY[s].label}: ${sev[s]}`}
              />
            ) : null,
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {SEVERITY_ORDER.filter((s) => sev[s]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-[11px] text-ot-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SEVERITY[s].hex }} />
              {SEVERITY[s].label} <span className="font-mono text-ot-text">{sev[s]}</span>
            </span>
          ))}
        </div>
      </div>

      <Card label="Silent assets" accent={SEVERITY.high.hex}>
        <div className="text-2xl font-semibold tabular-nums">{kpis.silent_count}</div>
        <div className="text-[11px] text-ot-muted">operations</div>
      </Card>
      <Card label="Cross-zone violations" accent={SEVERITY.critical.hex}>
        <div className="text-2xl font-semibold tabular-nums">{kpis.cross_zone_count}</div>
        <div className="text-[11px] text-ot-muted">security</div>
      </Card>
      <Card label="Vulnerable assets" accent="#a78bfa">
        <div className="text-2xl font-semibold tabular-nums">{kpis.vulnerable_asset_count}</div>
        <div className="text-[11px] text-ot-muted">with known CVEs</div>
      </Card>
    </div>
  );
}
