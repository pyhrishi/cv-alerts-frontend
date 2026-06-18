import { CategoryBadge } from "./CategoryBadge";
import { SeverityChip } from "./SeverityChip";
import { fmtMs, fmtTime, isPlainObject, prettyKey } from "@/lib/format";
import { zoneColor } from "@/lib/tokens";
import type { Alert, Asset } from "@/lib/types";

function Primitive({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "")
    return <span className="text-ot-dim">—</span>;
  if (typeof value === "boolean")
    return <span className={value ? "text-[#34d399]" : "text-ot-muted"}>{value ? "yes" : "no"}</span>;
  return <span className="text-ot-text">{String(value)}</span>;
}

function EvidenceValue({ value }: { value: unknown }) {
  // array of objects -> compact rows; array of primitives -> chips
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-ot-dim">none</span>;
    if (isPlainObject(value[0])) {
      return (
        <div className="space-y-1">
          {value.slice(0, 12).map((item, i) => (
            <div key={i} className="flex flex-wrap gap-x-3 gap-y-0.5 rounded bg-ot-bg/60 px-2 py-1 text-xs">
              {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                <span key={k}>
                  <span className="text-ot-dim">{prettyKey(k)}:</span> <Primitive value={v} />
                </span>
              ))}
            </div>
          ))}
          {value.length > 12 && <div className="text-xs text-ot-dim">+{value.length - 12} more</div>}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v, i) => (
          <span key={i} className="rounded bg-ot-bg px-1.5 py-0.5 font-mono text-[11px] text-ot-text">
            {String(v)}
          </span>
        ))}
      </div>
    );
  }
  if (isPlainObject(value)) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {Object.entries(value).map(([k, v]) => (
          <span key={k} className="text-xs">
            <span className="text-ot-dim">{prettyKey(k)}:</span> <Primitive value={v} />
          </span>
        ))}
      </div>
    );
  }
  return <Primitive value={value} />;
}

function AssetCard({ a }: { a: Asset }) {
  return (
    <div className="rounded-md border border-ot-border bg-ot-bg/50 p-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: zoneColor(a.zone) }} />
        <span className="font-medium text-ot-text">{a.name}</span>
        {a.is_controller && (
          <span className="rounded bg-ot-panel px-1 text-[9px] uppercase text-ot-muted">controller</span>
        )}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-ot-muted">
        <span>IP: <span className="font-mono text-ot-text">{a.ip ?? "—"}</span></span>
        <span>MAC: <span className="font-mono text-ot-text">{a.mac ?? "—"}</span></span>
        <span>Zone: <span className="text-ot-text">{a.zone}</span></span>
        <span>Vendor: <span className="text-ot-text">{a.vendor ?? "—"}</span></span>
        {a.last_seen_ms ? <span className="col-span-2">Last seen: {fmtMs(a.last_seen_ms)}</span> : null}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ot-dim">{title}</h4>
      {children}
    </div>
  );
}

export function AlertDetail({ alert, onShowInGraph }: { alert: Alert; onShowInGraph: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ot-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityChip severity={alert.severity} />
          <CategoryBadge category={alert.category} />
          {alert.score != null && (
            <span className="rounded bg-ot-panel px-1.5 py-0.5 text-[11px] text-ot-muted">
              exposure score <span className="font-mono text-ot-text">{alert.score}</span>
            </span>
          )}
          <span className="ml-auto text-[11px] text-ot-dim">detected {fmtTime(alert.detected_at)}</span>
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-ot-text">{alert.title}</h3>
        <button
          onClick={() => onShowInGraph(alert.id)}
          className="mt-3 rounded-md border border-ot-line bg-ot-panel px-2.5 py-1 text-xs font-medium text-ot-accent hover:bg-ot-hover"
        >
          Show in communication graph →
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Section title={`Affected asset${alert.assets.length > 1 ? "s" : ""} (${alert.assets.length})`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {alert.assets.slice(0, 8).map((a) => <AssetCard key={a.id} a={a} />)}
          </div>
          {alert.assets.length > 8 && (
            <div className="mt-1 text-xs text-ot-dim">+{alert.assets.length - 8} more assets</div>
          )}
        </Section>

        <Section title="Evidence">
          <div className="space-y-2 rounded-md border border-ot-border bg-ot-surface p-3">
            {Object.entries(alert.evidence).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-2">
                <div className="text-xs font-medium text-ot-muted">{prettyKey(k)}</div>
                <div className="min-w-0 text-xs"><EvidenceValue value={v} /></div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Why it matters">
          <p className="text-sm leading-relaxed text-ot-text/90">{alert.rationale}</p>
        </Section>

        {alert.compliance_ref && (
          <Section title="Compliance reference">
            <p className="text-xs leading-relaxed text-ot-muted">{alert.compliance_ref}</p>
          </Section>
        )}

        <Section title="Recommended action">
          <p className="rounded-md border border-ot-line bg-ot-panel p-3 text-sm leading-relaxed text-ot-text/90">
            {alert.recommended_action}
          </p>
        </Section>
      </div>
    </div>
  );
}
