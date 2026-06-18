// SINGLE source of truth for severity + zone colors. Imported everywhere (chips, KPI segments,
// graph node colors, legends, charts) so the palette can never drift. Components apply these as
// inline styles for dynamic values rather than Tailwind classes, which keeps "define once" honest.

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export const SEVERITY: Record<Severity, { hex: string; label: string }> = {
  critical: { hex: "#ef4444", label: "Critical" }, // red
  high: { hex: "#f97316", label: "High" }, // orange
  medium: { hex: "#f59e0b", label: "Medium" }, // amber
  low: { hex: "#3b82f6", label: "Low" }, // blue
  info: { hex: "#9ca3af", label: "Info" }, // grey
};

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];
export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4, high: 3, medium: 2, low: 1, info: 0,
};

export type ZoneKey = "Level 0-1" | "Level 2" | "Level 3-4" | "unknown";

export const ZONE: Record<string, { hex: string; label: string; short: string }> = {
  "Level 0-1": { hex: "#22d3ee", label: "Level 0-1 · Field devices", short: "Field" },
  "Level 2": { hex: "#a78bfa", label: "Level 2 · Control (PLCs/switches)", short: "Control" },
  "Level 3-4": { hex: "#f472b6", label: "Level 3-4 · Site / IT", short: "Site/IT" },
  unknown: { hex: "#64748b", label: "Unknown level", short: "Unknown" },
};

export const CATEGORY: Record<string, { label: string; hex: string }> = {
  security: { label: "Security", hex: "#f472b6" },
  operations: { label: "Operations", hex: "#38bdf8" },
  custom: { label: "Vulnerability", hex: "#a78bfa" },
};

export function zoneColor(zone?: string | null): string {
  return ZONE[zone ?? "unknown"]?.hex ?? ZONE.unknown.hex;
}
export function severityColor(sev?: string | null): string {
  return SEVERITY[(sev ?? "info") as Severity]?.hex ?? SEVERITY.info.hex;
}
