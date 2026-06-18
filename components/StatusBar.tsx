import type { DataSource, ReferenceNow } from "@/lib/types";

function clock(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function StatusBar({
  dataSource, referenceNow, lastUpdated, stale, onRefresh,
}: {
  dataSource: DataSource;
  referenceNow: ReferenceNow;
  lastUpdated: number | null;
  stale: boolean;
  onRefresh: () => void;
}) {
  const live = dataSource === "live";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ot-border bg-ot-surface/80 px-5 py-2 text-xs backdrop-blur">
      {/* data source — honesty on the glass */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide"
        style={{
          color: live ? "#34d399" : "#f59e0b",
          backgroundColor: live ? "#34d39915" : "#f59e0b15",
          border: `1px solid ${live ? "#34d39955" : "#f59e0b55"}`,
        }}
        title={live ? "Served from the live Cyber Vision Center" : "Center unreachable — served from saved snapshot"}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: live ? "#34d399" : "#f59e0b" }} />
        {live ? "Live data" : "Snapshot"}
      </span>

      <span className="text-ot-muted">
        <span className="text-ot-dim">reference time:</span> {referenceNow.label}
      </span>

      <div className="ml-auto flex items-center gap-3">
        {stale && <span className="text-[#f59e0b]">⚠ update failed — showing last good data</span>}
        <span className="text-ot-muted">
          <span className="text-ot-dim">last updated</span>{" "}
          <span className="font-mono text-ot-text">{clock(lastUpdated)}</span>
        </span>
        <button
          onClick={onRefresh}
          className="rounded border border-ot-line bg-ot-panel px-2 py-1 font-medium text-ot-muted hover:bg-ot-hover hover:text-ot-text"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
