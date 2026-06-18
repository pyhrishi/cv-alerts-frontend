"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CATEGORY, SEVERITY, SEVERITY_ORDER } from "@/lib/tokens";
import type { KpisResponse } from "@/lib/types";

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ot-border bg-ot-surface p-4 shadow-panel">
      <h3 className="text-sm font-semibold text-ot-text">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-ot-muted">{subtitle}</p>}
      <div className="h-64">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  background: "#10151c", border: "1px solid #222c38", borderRadius: 8, fontSize: 12, color: "#e6edf3",
};

export function Trends({ kpis }: { kpis: KpisResponse }) {
  const sevData = SEVERITY_ORDER
    .map((s) => ({ name: SEVERITY[s].label, key: s, value: kpis.active_alerts_by_severity[s] ?? 0 }))
    .filter((d) => d.value > 0);

  const catData = (Object.keys(kpis.active_alerts_by_category) as (keyof typeof kpis.active_alerts_by_category)[])
    .map((c) => ({ name: CATEGORY[c]?.label ?? c, key: c, value: kpis.active_alerts_by_category[c] }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Severity distribution" subtitle="Active alerts by severity">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sevData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
              {sevData.map((d) => <Cell key={d.key} fill={SEVERITY[d.key].hex} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {sevData.map((d) => (
            <span key={d.key} className="inline-flex items-center gap-1 text-[11px] text-ot-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEVERITY[d.key].hex }} />
              {d.name} <span className="font-mono text-ot-text">{d.value}</span>
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Alerts by category" subtitle="Security · Operations · Vulnerability exposure">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={catData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "#8b97a7", fontSize: 11 }} axisLine={{ stroke: "#222c38" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#8b97a7", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {catData.map((d) => <Cell key={d.key} fill={CATEGORY[d.key]?.hex ?? "#38bdf8"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
