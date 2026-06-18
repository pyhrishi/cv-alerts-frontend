"use client";

import { useMemo, useState } from "react";

import { AlertDetail } from "./AlertDetail";
import { AlertRow } from "./AlertRow";
import { EmptyState } from "./states";
import { SEVERITY_ORDER, SEVERITY_RANK, type Severity } from "@/lib/tokens";
import type { Alert, Category } from "@/lib/types";

type SortKey = "severity" | "recent" | "category";
const CATEGORIES: (Category | "all")[] = ["all", "security", "operations", "custom"];

function Segmented<T extends string>({
  options, value, onChange, colorFor,
}: { options: T[]; value: T; onChange: (v: T) => void; colorFor?: (v: T) => string | undefined }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = o === value;
        const c = colorFor?.(o);
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
              active ? "bg-ot-hover text-ot-text" : "text-ot-muted hover:bg-ot-panel/60"
            }`}
            style={active && c ? { color: c, boxShadow: `inset 0 -2px 0 ${c}` } : undefined}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function AlertsPanel({
  alerts, selectedId, onSelect, onShowInGraph, initialCategory = "all",
}: {
  alerts: Alert[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onShowInGraph: (id: string) => void;
  initialCategory?: Category | "all";
}) {
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [sort, setSort] = useState<SortKey>("severity");

  const filtered = useMemo(() => {
    let list = alerts.filter(
      (a) => (category === "all" || a.category === category) && (severity === "all" || a.severity === severity),
    );
    list = [...list].sort((a, b) => {
      if (sort === "severity") return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      if (sort === "recent") return (b.detected_at || "").localeCompare(a.detected_at || "");
      return a.category.localeCompare(b.category);
    });
    return list;
  }, [alerts, category, severity, sort]);

  const selected = alerts.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
      {/* list + filters */}
      <div className="flex min-h-0 flex-col rounded-lg border border-ot-border bg-ot-surface shadow-panel">
        <div className="space-y-2 border-b border-ot-border p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ot-text">Alerts</h2>
            <span className="text-xs text-ot-muted">{filtered.length} shown</span>
          </div>
          <Segmented options={CATEGORIES} value={category} onChange={setCategory} />
          <Segmented
            options={["all", ...SEVERITY_ORDER]}
            value={severity}
            onChange={setSeverity}
          />
          <div className="flex items-center gap-2 pt-1 text-[11px] text-ot-dim">
            <span>sort</span>
            <Segmented options={["severity", "recent", "category"] as SortKey[]} value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="min-h-0 flex-1 divide-y divide-ot-border/60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No active alerts"
                hint={category !== "all" || severity !== "all" ? "No alerts match the current filters." : "All clear in this dataset."}
              />
            </div>
          ) : (
            filtered.map((a) => (
              <AlertRow key={a.id} alert={a} selected={a.id === selectedId} onSelect={onSelect} />
            ))
          )}
        </div>
      </div>

      {/* detail */}
      <div className="min-h-0 overflow-hidden rounded-lg border border-ot-border bg-ot-surface shadow-panel">
        {selected ? (
          <AlertDetail alert={selected} onShowInGraph={onShowInGraph} />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-ot-muted">
            Select an alert to see evidence, rationale, compliance mapping, and recommended action.
          </div>
        )}
      </div>
    </div>
  );
}
