"use client";

import { useMemo, useState } from "react";

import { SeverityChip } from "./SeverityChip";
import { CategoryBadge } from "./CategoryBadge";
import { assetSummary, fmtTime } from "@/lib/format";
import { SEVERITY_RANK } from "@/lib/tokens";
import type { Alert } from "@/lib/types";

function evidenceSummary(a: Alert): string {
  const e = a.evidence as Record<string, any>;
  if (a.category === "operations")
    return `${e.seconds_behind_zone_median ?? "?"}s behind ${e.subnet ?? "zone"} median`;
  if (a.category === "security") {
    if (e.rule === "SKIP_LEVEL") return `${e.rule}: reaches ${e.peer_count ?? "?"} field device(s)`;
    return `${e.rule}: ${(e.protocols ?? []).join(", ")}`;
  }
  if (a.category === "custom")
    return `score ${e.exposure_score}, ${e.cve_count} CVEs, max CVSS ${e.max_cvss}`;
  return "";
}

type Col = { key: string; label: string; value: (a: Alert) => string | number };
const COLS: Col[] = [
  { key: "severity", label: "Severity", value: (a) => a.severity },
  { key: "category", label: "Category", value: (a) => a.category },
  { key: "title", label: "Title", value: (a) => a.title },
  { key: "asset", label: "Affected asset(s)", value: (a) => assetSummary(a.assets) },
  { key: "evidence", label: "Key evidence", value: (a) => evidenceSummary(a) },
  { key: "compliance", label: "Compliance", value: (a) => a.compliance_ref ?? "" },
  { key: "detected", label: "Detected", value: (a) => fmtTime(a.detected_at) },
];

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ReportsTable({ alerts }: { alerts: Alert[] }) {
  const [sortKey, setSortKey] = useState<string>("severity");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    const col = COLS.find((c) => c.key === sortKey)!;
    return [...alerts].sort((a, b) => {
      if (sortKey === "severity") return (SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) * dir;
      return String(col.value(a)).localeCompare(String(col.value(b))) * dir;
    });
  }, [alerts, sortKey, dir]);

  const toggle = (key: string) => {
    if (key === sortKey) setDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setDir(-1); }
  };

  const copyCsv = async () => {
    const header = COLS.map((c) => c.label).join(",");
    const body = rows.map((a) => COLS.map((c) => csvEscape(c.value(a))).join(",")).join("\n");
    await navigator.clipboard.writeText(`${header}\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-ot-border bg-ot-surface shadow-panel">
      <div className="no-print flex items-center justify-between border-b border-ot-border p-3">
        <div>
          <h2 className="text-sm font-semibold text-ot-text">Alert report</h2>
          <p className="text-xs text-ot-muted">{rows.length} alerts · sortable · export for the record</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyCsv}
            className="rounded-md border border-ot-line bg-ot-panel px-2.5 py-1 text-xs font-medium text-ot-text hover:bg-ot-hover"
          >
            {copied ? "Copied ✓" : "Copy as CSV"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-md border border-ot-line bg-ot-panel px-2.5 py-1 text-xs font-medium text-ot-text hover:bg-ot-hover"
          >
            Print
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-ot-panel text-ot-muted">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggle(c.key)}
                  className="no-print cursor-pointer select-none whitespace-nowrap border-b border-ot-border px-3 py-2 font-semibold uppercase tracking-wider hover:text-ot-text"
                >
                  {c.label}
                  {sortKey === c.key && <span className="ml-1">{dir === 1 ? "▲" : "▼"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-ot-border/60 align-top hover:bg-ot-panel/40">
                <td className="px-3 py-2"><SeverityChip severity={a.severity} size="xs" /></td>
                <td className="px-3 py-2"><CategoryBadge category={a.category} /></td>
                <td className="px-3 py-2 text-ot-text">{a.title}</td>
                <td className="px-3 py-2 text-ot-muted">{assetSummary(a.assets)}</td>
                <td className="px-3 py-2 text-ot-muted">{evidenceSummary(a)}</td>
                <td className="max-w-[260px] px-3 py-2 text-ot-dim">{a.compliance_ref}</td>
                <td className="whitespace-nowrap px-3 py-2 text-ot-dim">{fmtTime(a.detected_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
