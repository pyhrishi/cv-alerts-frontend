import { SEVERITY, type Severity } from "@/lib/tokens";

export function SeverityChip({ severity, size = "sm" }: { severity: Severity; size?: "sm" | "xs" }) {
  const s = SEVERITY[severity] ?? SEVERITY.info;
  const pad = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase tracking-wide ${pad}`}
      style={{ color: s.hex, backgroundColor: `${s.hex}1f`, border: `1px solid ${s.hex}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.hex }} />
      {s.label}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: (SEVERITY[severity] ?? SEVERITY.info).hex }}
      title={SEVERITY[severity]?.label}
    />
  );
}
